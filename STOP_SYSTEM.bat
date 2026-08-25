@echo off
chcp 65001 >nul
title Stop Warehouse Training System
color 0C

echo ===================================================================
echo   🛑 กำลังปิดระบบ SWAN WAREHOUSE TRAINING SYSTEM...
echo ===================================================================
echo.

echo กำลังปิดเซิร์ฟเวอร์ Backend (Port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo กำลังปิดเซิร์ฟเวอร์ Frontend (Port 3100)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3100" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ✅ ปิดเซิร์ฟเวอร์ทั้งหมดเรียบร้อยแล้วครับ!
echo ===================================================================
timeout /t 3 >nul
