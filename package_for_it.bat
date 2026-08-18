@echo off
title Package Source Code for IT Handover
color 0B
echo ==========================================================
echo   Packaging Warehouse Training System for IT Department
echo ==========================================================
echo.
echo Packaging project files...
node package_project.js
echo.
echo ==========================================================
echo  Created: warehouse-system-cloud-handover.zip
echo  You can now send this zip file to your company IT team!
echo ==========================================================
echo.
pause
