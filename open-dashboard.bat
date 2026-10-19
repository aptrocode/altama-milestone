@echo off
rem Open the operator dashboard in the same browser profile as the running wall.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\wall-launcher.ps1" dashboard
if errorlevel 1 pause
