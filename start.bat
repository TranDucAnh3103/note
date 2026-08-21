@echo off
echo ==========================================
echo       MEMOSTACK V2 - STARTING SYSTEM
echo ==========================================
echo.

echo [1/2] Starting Backend Server (Node.js/Express)...
start "MemoStack Backend" cmd /k "cd server && npm run dev"

echo [2/2] Starting Frontend Client (React/Vite)...
start "MemoStack Frontend" cmd /k "cd client && npm run dev"

echo.
echo ==========================================
echo Servers are running in separate windows!
echo Backend: http://localhost:5001
echo Frontend: http://localhost:5173
echo ==========================================
echo You can close this window.
