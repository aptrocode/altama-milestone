@echo off
rem Altama wall: one click to build (when needed), start Sensor Service + wall, and open the kiosk browser.
rem Close the browser (Alt+F4) or this window to stop everything.
title Altama Wall
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\wall-launcher.ps1" start
