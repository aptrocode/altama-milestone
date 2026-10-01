@echo off
title ALTAMA Interactive Wall - Unified Server (HTTP 8080 ^& TUIO UDP 3333)
color 0A

echo =====================================================================
echo           ALTAMA INTERACTIVE DIGITAL WALL (2304 x 1344)
echo     UNIFIED SERVER: HTTP (8080) + RAW TUIO UDP RECEIVER (3333)
echo =====================================================================
echo.
echo Direktori: %~dp0
echo.

cd /d "%~dp0"

:: Cek ketersediaan Python
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python terdeteksi. Memulai Unified Server...
    echo.
    echo [*] Web Application: http://localhost:8080/
    echo [*] Raw TUIO UDP:    Port 3333 (LiDAR / Touch Tracker)
    echo [*] WebSocket Bridge: ws://localhost:3334
    echo.
    echo Tekan Ctrl + C di jendela ini untuk mematikan server.
    echo.
    start "" "http://localhost:8080/"
    python server.py 8080
    goto end
)

:: Cek ketersediaan Node.js / npx sebagai fallback
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] npx terdeteksi (Fallback HTTP Only). Memulai server http...
    echo.
    echo Server aktif di: http://localhost:8080/
    echo Tekan Ctrl + C di jendela ini untuk mematikan server.
    echo.
    start "" "http://localhost:8080/"
    npx -y serve -p 8080 .
    goto end
)

:: Jika tidak ada Python maupun Node.js
echo [PERINGATAN] Python atau Node.js tidak ditemukan di PATH sistem.
echo Membuka file langsung di browser default...
start "" "%~dp0index.html"

:end
pause
