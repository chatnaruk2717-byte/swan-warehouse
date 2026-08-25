@echo off
title Start Swan Warehouse with Docker
color 0B

echo ===================================================
echo   Starting Swan Warehouse with Docker...
echo ===================================================
echo.

docker compose up -d

echo.
echo Waiting for Docker containers to be ready...
timeout /t 6 /nobreak >nul

echo Opening browser at http://localhost:3100...
start http://localhost:3100

echo.
echo ===================================================
echo   Docker containers are running!
echo   - Web UI:     http://localhost:3100
echo   - phpMyAdmin: http://localhost:8080
echo ===================================================
echo.
timeout /t 5 >nul
