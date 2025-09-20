@echo off
echo.
echo 🚀 Starting Both N8n Mapping Engine Servers
echo.
echo ========================================
echo 📊 Standalone Mapping Engine (Port 3000)
echo 🎨 Lamatic.ai Integration Demo (Port 3001)
echo ========================================
echo.

REM Start the standalone mapping engine on port 3000
echo Starting standalone mapping engine...
start "Standalone Mapping Engine" cmd /k "node server.js"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start the Lamatic.ai integration demo on port 3001
echo Starting Lamatic.ai integration demo...
start "Lamatic Integration Demo" cmd /k "cd lamatic-integration && node demo-server.js"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Open both in browser
echo.
echo 🌐 Opening both demos in browser...
start chrome http://localhost:3000
start chrome http://localhost:3001

echo.
echo ✅ Both servers are now running!
echo.
echo 📊 Standalone: http://localhost:3000
echo 🎨 Integration: http://localhost:3001
echo.
echo Press any key to close this window...
pause >nul
