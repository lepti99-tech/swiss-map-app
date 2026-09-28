@echo off
echo.
echo ========================================
echo   Swiss Map App wird gestartet...
echo ========================================
echo.

REM Alten Prozess auf Port 8000 beenden, falls vorhanden
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

start http://localhost:8000

python -m http.server 8000

pause