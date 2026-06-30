@echo off
title Push Project to GitHub
color 0B
echo ==================================================
echo   Warehouse System - Auto Push to GitHub
echo ==================================================
echo.

:: Check if git is installed locally
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Not found Git on your computer!
    echo Please download and install Git from: https://git-scm.com/
    echo.
    pause
    exit /b
)

echo Initialize Git repository...
git init
git add .
git commit -m "initial commit: warehouse training system"

echo.
set /p repo_url="Enter your GitHub Repository URL (e.g., https://github.com/username/repo.git): "

if "%repo_url%"=="" (
    echo [ERROR] Repository URL cannot be empty!
    pause
    exit /b
)

echo.
echo Connecting to remote repository...
git remote remove origin >nul 2>nul
git remote add origin %repo_url%
git branch -M main

echo.
echo Pushing code to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==================================================
    echo   [SUCCESS] Code successfully uploaded to GitHub!
    echo ==================================================
) else (
    echo.
    echo [WARNING] Push failed. Make sure the repository is empty and your SSH/HTTPS credentials are correct.
)
echo.
pause
