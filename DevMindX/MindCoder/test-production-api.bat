@echo off
echo ========================================
echo Testing Production API Endpoints
echo ========================================
echo.

set BASE_URL=https://devmindx.vercel.app

echo Testing /api/health...
curl -s %BASE_URL%/api/health
echo.
echo.

echo Testing /api/llm/models (requires auth)...
echo Note: You need to add your token below
set /p TOKEN="Enter your auth token (or press Enter to skip): "
if not "%TOKEN%"=="" (
    curl -s -H "Authorization: Bearer %TOKEN%" -H "x-user-id: YOUR_USER_ID" %BASE_URL%/api/llm/models
    echo.
)
echo.

echo Testing /api/projects (requires auth)...
if not "%TOKEN%"=="" (
    curl -s -H "Authorization: Bearer %TOKEN%" %BASE_URL%/api/projects
    echo.
)
echo.

echo ========================================
echo Test Complete
echo ========================================
echo.
echo If you see 404 errors, check:
echo 1. Vercel deployment logs
echo 2. Environment variables in Vercel
echo 3. MongoDB connection string
echo.
pause
