@echo off
chcp 65001 >nul
title Start Warehouse System with Docker
color 0B

echo ===================================================================
echo   🐳 SWAN WAREHOUSE TRAINING SYSTEM - DOCKER LAUNCHER
echo ===================================================================
echo.

echo [1/2] กำลังเริ่มทำงาน Docker Containers (MySQL, Backend, Frontend 3100)...
docker compose up -d

echo.
echo ⏳ รอระบบ Docker เริ่มต้น 5 วินาที...
timeout /t 5 /nobreak >nul

echo [2/2] เปิดเบราว์เซอร์อัตโนมัติ...
start "" "http://localhost:3100"

echo.
echo ===================================================================
echo   🎉 ระบบ Docker พร้อมใช้งานแล้ว!
echo   - 🌐 หน้าเว็บหลัก:     http://localhost:3100
echo   - 🗄️  phpMyAdmin (DB): http://localhost:8080
echo ===================================================================
echo.
timeout /t 5 >nul
