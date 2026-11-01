@echo off
echo ==========================================
echo       MEMOSTACK V2 - STARTING SYSTEM
echo ==========================================
echo.
echo Starting Hidden Dashboard on Port 8080...
echo All processes will run entirely in the background (no CMD windows).
echo.
echo Opening browser to http://localhost:8080...
start http://localhost:8080

:: Run the dashboard silently via VBScript
cscript //nologo start-hidden.vbs

:: Exit this script and close the terminal
exit
