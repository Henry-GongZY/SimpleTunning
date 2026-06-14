@echo off
echo Starting SimpleTunning Platform (Local Mode)...

REM Start backend
start "SimpleTunning Backend" cmd /c "cd /d %~dp0..\backend && pip install -r requirements.txt > nul 2>&1 && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

REM Wait for backend
timeout /t 2 /nobreak > nul

REM Start frontend dev server
start "SimpleTunning Frontend" cmd /c "cd /d %~dp0..\frontend && npm install > nul 2>&1 && npm run dev"

echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Close the terminal windows to stop the servers.
pause
