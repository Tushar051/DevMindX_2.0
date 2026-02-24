@echo off
REM DevMindX Vercel Deployment Script for Windows

echo.
echo 🚀 DevMindX Vercel Deployment
echo ================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI not found. Installing...
    call npm install -g vercel
)

REM Login to Vercel
echo 🔐 Logging in to Vercel...
call vercel login

REM Build the application
echo 🔨 Building application...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

REM Deploy to Vercel
echo 🌐 Deploying to Vercel...
call vercel --prod

echo.
echo ✅ Deployment Complete!
echo =======================
echo.
echo ⚠️  Next Steps:
echo 1. Get your Vercel URL from the output above
echo 2. Update OAuth callback URLs:
echo    - Google: https://console.cloud.google.com
echo    - GitHub: https://github.com/settings/developers
echo 3. Update environment variables in Vercel dashboard:
echo    - GOOGLE_CALLBACK_URL
echo    - GITHUB_CALLBACK_URL
echo 4. Redeploy if you updated environment variables
echo 5. Test your application
echo.
echo 📚 Full guide: VERCEL_COMPLETE_DEPLOYMENT.md
echo.
pause
