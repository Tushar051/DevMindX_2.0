@echo off
echo ========================================
echo MongoDB Local Setup for DevMindX
echo ========================================
echo.

echo Checking if MongoDB is installed...
where mongod >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ MongoDB is installed
    echo.
    
    echo Checking MongoDB service status...
    sc query MongoDB | find "RUNNING" >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✓ MongoDB service is running
    ) else (
        echo ✗ MongoDB service is not running
        echo.
        echo Starting MongoDB service...
        net start MongoDB
        if %ERRORLEVEL% EQU 0 (
            echo ✓ MongoDB service started successfully
        ) else (
            echo ✗ Failed to start MongoDB service
            echo   Try running this script as Administrator
        )
    )
) else (
    echo ✗ MongoDB is not installed
    echo.
    echo Please install MongoDB:
    echo 1. Visit: https://www.mongodb.com/try/download/community
    echo 2. Download MongoDB Community Server for Windows
    echo 3. Run the installer
    echo 4. Choose "Complete" installation
    echo 5. Install as a Service
    echo 6. Run this script again
    echo.
    echo Or read SETUP_LOCAL_MONGODB.md for detailed instructions
)

echo.
echo ========================================
echo Configuration
echo ========================================
echo.
echo Your .env file is configured for local MongoDB:
echo   MONGODB_URI=mongodb://localhost:27017/devmindx
echo   MONGODB_DB=devmindx
echo.

echo ========================================
echo Next Steps
echo ========================================
echo.
echo 1. Make sure MongoDB is running (check above)
echo 2. Start your app: npm run dev
echo 3. Look for: "✓ Connected to MongoDB successfully"
echo.
echo If you see connection errors:
echo   - Check MongoDB service is running
echo   - Check port 27017 is not blocked
echo   - Read SETUP_LOCAL_MONGODB.md for troubleshooting
echo.

pause
