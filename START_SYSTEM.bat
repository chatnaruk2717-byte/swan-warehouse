@echo off
title Swan Warehouse System Launcher
color 0A

echo ===================================================
echo   SWAN WAREHOUSE TRAINING SYSTEM - LAUNCHER
echo ===================================================
echo.

echo [1/3] Clearing old ports 5000 and 3100...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3100" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo [2/3] Starting Backend API Server on Port 5000...
start "Warehouse Backend API" cmd /k "cd /d %~dp0backend && npm run dev"

echo [3/3] Starting Frontend Web Server on Port 3100...
start "Warehouse Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 6 /nobreak >nul

echo Opening browser at http://localhost:3100...
start http://localhost:3100

echo.
echo ===================================================
echo   System is now running!
echo   - Frontend Web UI: http://localhost:3100
echo   - Backend API:     http://localhost:5000
echo ===================================================
echo.
pause
