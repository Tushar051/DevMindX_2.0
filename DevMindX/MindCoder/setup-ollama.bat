@echo off
echo ========================================
echo DevMindX - Ollama Setup Script
echo ========================================
echo.

REM Check if Ollama is installed
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ollama is not installed!
    echo.
    echo Please download and install Ollama from:
    echo https://ollama.com/download
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo [OK] Ollama is installed
echo.

REM Check if Ollama is running
echo Checking if Ollama service is running...
curl -s http://localhost:11434/api/tags >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Ollama service is not running
    echo Starting Ollama service...
    start "" ollama serve
    timeout /t 3 /nobreak >nul
)

echo [OK] Ollama service is running
echo.

REM Pull recommended models
echo ========================================
echo Downloading Recommended Models
echo ========================================
echo.
echo This will download the following models:
echo 1. llama3.2 (General purpose, ~2GB)
echo 2. deepseek-coder (Coding specialist, ~3.8GB)
echo.
echo Note: This may take several minutes depending on your internet speed.
echo.

set /p CONFIRM="Do you want to continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Setup cancelled.
    pause
    exit /b 0
)

echo.
echo Pulling llama3.2...
ollama pull llama3.2
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to pull llama3.2
) else (
    echo [OK] llama3.2 downloaded successfully
)

echo.
echo Pulling deepseek-coder...
ollama pull deepseek-coder
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to pull deepseek-coder
) else (
    echo [OK] deepseek-coder downloaded successfully
)

echo.
echo ========================================
echo Verifying Installation
echo ========================================
echo.
echo Installed models:
ollama list

echo.
echo ========================================
echo Configuration
echo ========================================
echo.
echo Updating .env file...

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found. Creating from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env"
    ) else (
        echo [ERROR] .env.example not found!
        pause
        exit /b 1
    )
)

REM Update .env file to enable Ollama
powershell -Command "(Get-Content .env) -replace 'USE_OLLAMA=false', 'USE_OLLAMA=true' | Set-Content .env"
powershell -Command "if ((Get-Content .env) -notmatch 'USE_OLLAMA=') { Add-Content .env 'USE_OLLAMA=true' }"

echo [OK] .env file updated
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Ollama is now configured and ready to use.
echo.
echo Next steps:
echo 1. Start your DevMindX server: npm run dev
echo 2. Open the application in your browser
echo 3. Select any AI model - it will use Ollama locally!
echo.
echo To test Ollama directly, run:
echo   ollama run llama3.2
echo.
echo For more information, see OLLAMA_SETUP_GUIDE.md
echo.
pause
