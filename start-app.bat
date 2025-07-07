@echo off

cd /d "D:\andromeda"

REM Start Next.js server in a new minimized window
start "Next.js Server" /min npm run start

REM Give the server a moment to start
timeout /t 1 /nobreak >NUL

REM Launch the Nativefier application
start "Andromeda App" "Andromeda-win32-x64\Andromeda.exe"

exit