@echo off
title Run Warehouse Training System Locally
color 0E
echo ==================================================
echo   Warehouse System - Start Local Server
echo ==================================================
echo.

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this computer!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b
)

echo [1/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend dependencies installation failed.
    pause
    exit /b
)

echo [2/4] Installing frontend dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend dependencies installation failed.
    pause
    exit /b
)

echo [3/4] Starting Backend API in a new window...
cd ../backend
start cmd /k "title Backend API && npm run dev"

echo [4/4] Starting Frontend Next.js Web App...
cd ../frontend
echo System is starting. Press Ctrl+C to stop.
echo.
npm run dev

pause
