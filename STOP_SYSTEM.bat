@echo off
title Stop Swan Warehouse System
color 0C

echo ===================================================
echo   Stopping Swan Warehouse Servers...
echo ===================================================
echo.

echo Stopping Backend on Port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Stopping Frontend on Port 3100...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3100" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo All servers have been stopped successfully.
echo ===================================================
timeout /t 3 >nul
