@echo off
title ALTAMA Interactive Wall - Universal Sensor Server (HTTP 8080 ^& TUIO 3333 ^& Augmenta 12000)
color 0A

echo =====================================================================
echo           ALTAMA INTERACTIVE DIGITAL WALL (2304 x 1344)
echo   UNIVERSAL SENSOR SERVER: TUIO (3333) + AUGMENTA (12000) + HTTP (8080)
echo =====================================================================
echo.
echo Direktori: %~dp0
echo.

cd /d "%~dp0"

:: Cek ketersediaan Python
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python terdeteksi. Memulai Universal Server...
    echo.
    echo [*] Web Application: http://localhost:8080/
    echo [*] TUIO 1.1 / 2.0:   UDP Port 3333
    echo [*] Augmenta Sensor:  UDP Port 12000 (Augmenta Simulator Default)
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

echo [PERINGATAN] Python atau Node.js tidak ditemukan di PATH sistem.
echo Membuka file langsung di browser default...
start "" "%~dp0index.html"

:end
pause
