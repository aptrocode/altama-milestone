@echo off
rem Stop the Altama wall started by start-wall.bat (Sensor Service, wall server, kiosk browser).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\wall-launcher.ps1" stop
ping -n 4 127.0.0.1 >nul
