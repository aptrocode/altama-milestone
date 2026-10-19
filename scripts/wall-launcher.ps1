# Altama wall launcher for the event PC (Windows PowerShell 5.1+).
#
#   start      build when needed, start Sensor Service + wall server, open the browser in kiosk mode,
#              and stop everything when the browser closes, this window closes, or Ctrl+C is pressed.
#   dashboard  open /dashboard in the same browser profile (hold settings live in its localStorage).
#   stop       stop a running launcher and everything it started.
#
# Settings come from .env (optional): WALL_PORT (default 3300), NUXT_PUBLIC_SENSOR_ENABLED (default
# true), NUXT_PUBLIC_SENSOR_WS_URL (default ws://127.0.0.1:<WS_PORT>), WS_PORT (default 8787).
# Keep this file ASCII: Windows PowerShell 5.1 reads BOM-less scripts in the ANSI code page.

param([ValidateSet('start', 'dashboard', 'stop')][string]$Mode = 'start')

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$RunDir = Join-Path $Root '.wall-run'
$LogDir = Join-Path $RunDir 'logs'
$ProfileDir = Join-Path $RunDir 'browser-profile'
$PidFile = Join-Path $RunDir 'launcher.pid'
Set-Location $Root
New-Item -ItemType Directory -Force $LogDir | Out-Null

function Say([string]$Text, [string]$Color = 'Gray') {
  Write-Host ("[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $Text) -ForegroundColor $Color
}

function Fail([string]$Text) {
  Say $Text 'Red'
  if ($Mode -eq 'start') { Read-Host 'Tekan Enter untuk menutup' | Out-Null }
  exit 1
}

function Read-DotEnv {
  $values = @{}
  $file = Join-Path $Root '.env'
  if (Test-Path $file) {
    foreach ($line in Get-Content $file) {
      if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$') {
        $values[$Matches[1]] = $Matches[2].Trim('"', "'")
      }
    }
  }
  return $values
}

$DotEnv = Read-DotEnv
function Setting([string]$Name, [string]$Default) {
  $fromProcess = [Environment]::GetEnvironmentVariable($Name)
  if ($fromProcess) { return $fromProcess }
  if ($DotEnv.ContainsKey($Name) -and $DotEnv[$Name] -ne '') { return $DotEnv[$Name] }
  return $Default
}

$WallPort = [int](Setting 'WALL_PORT' '3300')
$WsPort = [int](Setting 'WS_PORT' '8787')
$SensorEnabled = Setting 'NUXT_PUBLIC_SENSOR_ENABLED' 'true'
$SensorWsUrl = Setting 'NUXT_PUBLIC_SENSOR_WS_URL' "ws://127.0.0.1:$WsPort"
# One origin everywhere: localStorage (hold settings) is per origin, so localhost and 127.0.0.1 differ.
$WallUrl = "http://127.0.0.1:$WallPort"

function Get-LauncherProcess {
  # The file holds "PID|StartTimeTicks" so a reused PID never matches another process.
  if (-not (Test-Path $PidFile)) { return $null }
  $id, $ticks = (Get-Content $PidFile -Raw).Trim() -split '\|'
  $process = Get-Process -Id ([int]$id) -ErrorAction SilentlyContinue
  if ($process -and [int]$id -ne $PID -and "$($process.StartTime.Ticks)" -eq $ticks) { return $process }
  return $null
}

function Find-Browser {
  $candidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
  )
  foreach ($path in $candidates) {
    if ($path -and (Test-Path $path)) { return $path }
  }
  return $null
}

function Test-WallServer {
  try {
    $response = Invoke-WebRequest -Uri "$WallUrl/" -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -eq 200
  }
  catch { return $false }
}

# ---------------------------------------------------------------- stop / dashboard

if ($Mode -eq 'stop') {
  $launcher = Get-LauncherProcess
  if (-not $launcher) { Say 'Wall tidak sedang berjalan.' 'Yellow'; exit 0 }
  Say "Menghentikan launcher (PID $($launcher.Id)) beserta Sensor Service, server wall, dan browser..."
  # The launcher's job object takes every child process down with it.
  Stop-Process -Id $launcher.Id -Force
  Remove-Item $PidFile -ErrorAction SilentlyContinue
  Say 'Selesai.' 'Green'
  exit 0
}

if ($Mode -eq 'dashboard') {
  if (-not (Test-WallServer)) { Fail "Wall belum berjalan di $WallUrl. Jalankan start-wall.bat dulu." }
  $browser = Find-Browser
  if (-not $browser) { Fail 'Chrome / Edge tidak ditemukan.' }
  Start-Process -FilePath $browser -ArgumentList @("--user-data-dir=`"$ProfileDir`"", "--app=$WallUrl/dashboard", '--no-first-run', '--no-default-browser-check')
  exit 0
}

# ---------------------------------------------------------------- start

$Host.UI.RawUI.WindowTitle = 'Altama Wall - jangan tutup jendela ini'

if (Get-LauncherProcess) { Fail 'Wall sudah berjalan di jendela lain. Tutup dulu (atau jalankan stop-wall.bat).' }

$bun = (Get-Command bun -ErrorAction SilentlyContinue).Source
if (-not $bun) { $bun = "$env:USERPROFILE\.bun\bin\bun.exe" }
if (-not (Test-Path $bun)) { Fail 'Bun tidak ditemukan. Install dari https://bun.sh lalu jalankan ulang.' }

$browser = Find-Browser
if (-not $browser) { Fail 'Chrome / Edge tidak ditemukan.' }

foreach ($port in @($WallPort, $WsPort)) {
  $busy = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($busy) {
    $owner = (Get-Process -Id $busy.OwningProcess -ErrorAction SilentlyContinue).ProcessName
    Fail "Port $port sudah dipakai ($owner, PID $($busy.OwningProcess)). Tutup 'bun dev' / 'sensor:service' yang masih jalan, lalu coba lagi."
  }
}

# Every process started from here on joins this job; when this PowerShell exits for any reason
# (browser closed, window closed with X, Ctrl+C, crash) Windows kills the whole job.
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public static class WallJob {
  [StructLayout(LayoutKind.Sequential)]
  struct BasicLimit {
    public long PerProcessUserTimeLimit; public long PerJobUserTimeLimit; public uint LimitFlags;
    public UIntPtr MinimumWorkingSetSize; public UIntPtr MaximumWorkingSetSize; public uint ActiveProcessLimit;
    public UIntPtr Affinity; public uint PriorityClass; public uint SchedulingClass;
  }
  [StructLayout(LayoutKind.Sequential)]
  struct IoCounters { public ulong a, b, c, d, e, f; }
  [StructLayout(LayoutKind.Sequential)]
  struct ExtendedLimit {
    public BasicLimit Basic; public IoCounters Io; public UIntPtr ProcessMemoryLimit; public UIntPtr JobMemoryLimit;
    public UIntPtr PeakProcessMemoryUsed; public UIntPtr PeakJobMemoryUsed;
  }

  [DllImport("kernel32.dll", CharSet = CharSet.Unicode)] static extern IntPtr CreateJobObject(IntPtr attributes, string name);
  [DllImport("kernel32.dll")] static extern bool SetInformationJobObject(IntPtr job, int infoClass, IntPtr info, uint length);
  [DllImport("kernel32.dll")] static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
  [DllImport("kernel32.dll")] static extern IntPtr GetCurrentProcess();

  static IntPtr handle;

  public static bool KillChildrenOnExit() {
    handle = CreateJobObject(IntPtr.Zero, null);
    if (handle == IntPtr.Zero) return false;
    var info = new ExtendedLimit();
    info.Basic.LimitFlags = 0x2000; // JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
    int size = Marshal.SizeOf(typeof(ExtendedLimit));
    IntPtr buffer = Marshal.AllocHGlobal(size);
    try {
      Marshal.StructureToPtr(info, buffer, false);
      if (!SetInformationJobObject(handle, 9, buffer, (uint)size)) return false; // JobObjectExtendedLimitInformation
    } finally { Marshal.FreeHGlobal(buffer); }
    return AssignProcessToJobObject(handle, GetCurrentProcess());
  }
}
'@
if (-not [WallJob]::KillChildrenOnExit()) {
  Say 'Peringatan: auto-cleanup saat jendela ditutup tidak aktif. Gunakan stop-wall.bat bila perlu.' 'Yellow'
}
Set-Content -Path $PidFile -Value "$PID|$((Get-Process -Id $PID).StartTime.Ticks)" -Encoding ascii

# Rebuild when the build is missing or older than the app sources/assets (raw new-assets excluded).
$serverEntry = Join-Path $Root '.output\server\index.mjs'
$buildStamp = Join-Path $Root '.output\nitro.json'
$needsBuild = -not (Test-Path $serverEntry)
if (-not $needsBuild) {
  $builtAt = (Get-Item $buildStamp).LastWriteTime
  $sources = @('app', 'shared', 'public') | ForEach-Object { Get-ChildItem (Join-Path $Root $_) -Recurse -File } |
    Where-Object { $_.FullName -notlike '*\public\new-assets\*' }
  $sources += @('nuxt.config.ts', 'package.json', 'bun.lock') | ForEach-Object { Join-Path $Root $_ } |
    Where-Object { Test-Path $_ } | ForEach-Object { Get-Item $_ }
  $newest = $sources | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  $needsBuild = $newest -and $newest.LastWriteTime -gt $builtAt
  if ($needsBuild) { Say "Ada perubahan sejak build terakhir ($($newest.Name))." }
}
if ($needsBuild) {
  Say 'Membangun wall (bun run build), tunggu sekitar 1 menit...' 'Cyan'
  & $bun run build
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $serverEntry)) { Fail 'Build gagal. Lihat pesan di atas.' }
}

foreach ($log in Get-ChildItem $LogDir -Filter *.log -ErrorAction SilentlyContinue) {
  if ($log.Length -gt 10MB) { Remove-Item $log.FullName }
}

# Child processes inherit these.
$env:PORT = "$WallPort"
$env:HOST = '127.0.0.1'
$env:WS_PORT = "$WsPort"
$env:NUXT_PUBLIC_SENSOR_ENABLED = $SensorEnabled
$env:NUXT_PUBLIC_SENSOR_WS_URL = $SensorWsUrl

function Start-WallProcess([string]$Name, [string]$Arguments) {
  $log = Join-Path $LogDir "$Name.log"
  Add-Content -Path $log -Value ("==== {0} start" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) -Encoding ascii
  $command = "`"$bun`" $Arguments >> `"$log`" 2>&1"
  return Start-Process -FilePath $env:ComSpec -ArgumentList @('/d', '/c', "`"$command`"") -WindowStyle Hidden -PassThru
}

function Stop-Tree($Process) {
  if ($Process -and -not $Process.HasExited) { & taskkill.exe /T /F /PID $Process.Id 2>&1 | Out-Null }
}

$services = [ordered]@{
  sensor = @{ Args = 'sensor-service/main.ts'; Label = "Sensor Service (WS $WsPort, OSC)"; Process = $null; Restarts = 0 }
  web = @{ Args = '.output/server/index.mjs'; Label = "Server wall ($WallUrl)"; Process = $null; Restarts = 0 }
}
$browserProcess = $null

try {
  foreach ($name in $services.Keys) {
    $services[$name].Process = Start-WallProcess $name $services[$name].Args
    Say "$($services[$name].Label) dijalankan."
  }

  $deadline = (Get-Date).AddSeconds(60)
  while (-not (Test-WallServer)) {
    if ((Get-Date) -gt $deadline -or $services.web.Process.HasExited) {
      Fail "Server wall tidak merespons. Lihat $LogDir\web.log"
    }
    Start-Sleep -Milliseconds 500
  }

  $browserArgs = @(
    "--user-data-dir=`"$ProfileDir`"", "--kiosk", $WallUrl,
    '--no-first-run', '--no-default-browser-check', '--disable-session-crashed-bubble', '--hide-crash-restore-bubble',
    '--noerrdialogs', '--disable-infobars', '--autoplay-policy=no-user-gesture-required',
    '--overscroll-history-navigation=0', '--disable-pinch', '--disable-features=Translate,TranslateUI'
  )
  $browserProcess = Start-Process -FilePath $browser -ArgumentList $browserArgs -PassThru
  Say "Wall tampil di layar (sensor input: $SensorEnabled)." 'Green'
  Write-Host ''
  Write-Host '  Menutup wall : Alt+F4 di browser, ATAU tutup jendela ini, ATAU stop-wall.bat' -ForegroundColor Cyan
  Write-Host '  Dashboard    : open-dashboard.bat (atur hold, sensor, kalibrasi)' -ForegroundColor Cyan
  Write-Host "  Log          : $LogDir" -ForegroundColor Cyan
  Write-Host ''

  while (-not $browserProcess.HasExited) {
    foreach ($name in $services.Keys) {
      $service = $services[$name]
      if ($service.Process.HasExited) {
        $service.Restarts++
        Say "$($service.Label) berhenti tiba-tiba; menjalankan ulang (ke-$($service.Restarts)). Lihat logs\$name.log" 'Yellow'
        Start-Sleep -Seconds 2
        $service.Process = Start-WallProcess $name $service.Args
      }
    }
    Start-Sleep -Seconds 1
  }
  Say 'Browser ditutup.'
}
finally {
  Say 'Menghentikan Sensor Service dan server wall...'
  foreach ($name in $services.Keys) { Stop-Tree $services[$name].Process }
  Stop-Tree $browserProcess
  Remove-Item $PidFile -ErrorAction SilentlyContinue
  Say 'Semua proses sudah berhenti.' 'Green'
}
