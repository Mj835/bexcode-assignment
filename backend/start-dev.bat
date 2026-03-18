@echo off
REM Quick start script for development (Windows)

echo 🚀 Starting Health Consultation Backend...
echo.

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env
    echo ✓ .env created. Please update with your configuration if needed.
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
)

REM Start in development mode
echo 🔧 Starting dev server with auto-reload...
call npm run dev
