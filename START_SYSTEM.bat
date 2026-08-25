@echo off
chcp 65001 >nul
title Warehouse Training & Skill Management System Launcher
color 0A

echo ===================================================================
echo   🚀 SWAN WAREHOUSE TRAINING SYSTEM - LAUNCHER
echo   ระบบจัดการทักษะและการฝึกอบรมคลังสินค้า
echo ===================================================================
echo.

:: 1. Clear any zombie processes on Port 5000 and 3100
echo [1/3] กำลังเคลียร์พอร์ต 5000 และ 3100 ที่อาจค้างอยู่...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3100" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: 2. Start Backend API Server
echo [2/3] กำลังเริ่มต้นระบบหลังบ้าน Backend API (Port 5000)...
start "Warehouse Backend API" /min cmd /c "cd /d %~dp0backend && npm run dev"

:: 3. Start Frontend Web Server
echo [3/3] กำลังเริ่มต้นระบบหน้าเว็บ Frontend UI (Port 3100)...
start "Warehouse Frontend UI" /min cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo ⏳ กำลังรอระบบเตรียมความพร้อม 5 วินาที...
timeout /t 5 /nobreak >nul

:: 4. Open Default Web Browser
echo.
echo ✅ เปิดหน้าเว็บเบราว์เซอร์อัตโนมัติที่ http://localhost:3100...
start "" "http://localhost:3100"

echo.
echo ===================================================================
echo   🎉 ระบบเปิดทำงานเรียบร้อยแล้ว!
echo   - 🌐 หน้าเว็บหลัก: http://localhost:3100
echo   - ⚙️  Backend API:  http://localhost:5000
echo ===================================================================
echo.
echo (คุณสามารถย่อหน้าต่างนี้ลงได้ หรือกดปิดหน้าต่างนี้เพื่อปิดระบบ)
echo.
pause
