@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Zainstaluj Node.js 22.13 lub nowszy i uruchom ten plik ponownie.
  pause
  exit /b 1
)
if not exist node_modules\.bin\vinext.cmd (
  call npm install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Otworz http://127.0.0.1:3000 w przegladarce.
call npm start
pause
