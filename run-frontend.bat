@echo off
title SIS Frontend - Vite Dev Server (Port 5173)
color 0A

echo ======================================================================
echo    STARTING SIS FRONTEND (REACT VITE DEV SERVER)
echo ======================================================================
echo.

cd /d "%~dp0"

echo Current Directory: %CD%
echo Starting Vite on http://localhost:5173 ...
echo Proxying /api and /r to backend on http://localhost:8085
echo.

npm run dev
pause
