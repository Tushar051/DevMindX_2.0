@echo off
echo ========================================
echo Testing Production Fixes Locally
echo ========================================
echo.

echo Checking if .env file has required variables...
echo.

findstr /C:"MONGODB_URI" .env >nul
if %errorlevel% neq 0 (
    echo [ERROR] MONGODB_URI not found in .env
    echo Please add: MONGODB_URI=your-mongodb-connection-string
    echo.
) else (
    echo [OK] MONGODB_URI found
)

findstr /C:"ALLOWED_ORIGINS" .env >nul
if %errorlevel% neq 0 (
    echo [WARNING] ALLOWED_ORIGINS not found in .env
    echo Add: ALLOWED_ORIGINS=http://localhost:5173,https://devmindx.vercel.app
    echo.
) else (
    echo [OK] ALLOWED_ORIGINS found
)

findstr /C:"JWT_SECRET" .env >nul
if %errorlevel% neq 0 (
    echo [ERROR] JWT_SECRET not found in .env
    echo Please add: JWT_SECRET=your-secret-key
    echo.
) else (
    echo [OK] JWT_SECRET found
)

echo.
echo ========================================
echo Starting local server...
echo ========================================
echo.
echo The server will start on http://localhost:5000
echo Test the health endpoint: http://localhost:5000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
