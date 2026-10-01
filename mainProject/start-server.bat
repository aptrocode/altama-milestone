@echo off
title ALTAMA Interactive Wall - Local Server (Port 8080)
color 0A

echo =====================================================================
echo           ALTAMA INTERACTIVE DIGITAL WALL (2304 x 1344)
echo =====================================================================
echo.
echo Sedang menyiapkan server lokal di port 8080...
echo Direktori: %~dp0
echo.

cd /d "%~dp0"

:: Cek ketersediaan Python
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python terdeteksi. Memulai HTTP server...
    echo.
    echo Server aktif di: http://localhost:8080/
    echo Tekan Ctrl + C di jendela ini untuk mematikan server.
    echo.
    start "" "http://localhost:8080/"
    python -m http.server 8080
    goto end
)

:: Cek ketersediaan Node.js / npx
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] npx terdeteksi. Memulai server http...
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
