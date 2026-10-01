@echo off
cd /d "%~dp0"
echo ===================================================
echo   ALTAMA Interactive Wall - Local Server
echo ===================================================
echo   Akses di browser: http://localhost:8080
echo ===================================================
start http://localhost:8080
python -m http.server 8080
pause