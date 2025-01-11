@echo off
echo Setting up the development environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo npm is not installed! Please install npm.
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install

REM Create a .env.local file if it doesn't exist
if not exist .env.local (
    echo Creating .env.local file...
    echo # Environment Variables > .env.local
    echo NEXT_PUBLIC_API_URL=http://localhost:3000 >> .env.local
)

echo Starting development server...
call npm run dev

pause 