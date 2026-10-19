@echo off
rem Altama wall: one click builds (when needed), starts the wall + Sensor Service, and opens the wall fullscreen.
rem Close this window to stop everything. Ctrl+Shift+D in the wall opens the dashboard.
title Altama Wall
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\wall-launcher.ps1"
