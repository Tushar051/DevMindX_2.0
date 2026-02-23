@echo off
REM DevMindX Supabase + Vercel Deployment Script for Windows

echo.
echo 🚀 DevMindX Supabase Deployment
echo ================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI not found. Installing...
    call npm install -g vercel
)

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found. Installing...
    call npm install -g supabase
)

REM Login to Vercel
echo 🔐 Logging in to Vercel...
call vercel login

REM Build the application
echo 🔨 Building application...
call npm run build

REM Deploy to Vercel
echo 🌐 Deploying to Vercel...
call vercel --prod

echo.
echo ✅ Deployment Complete!
echo =======================
echo.
echo ⚠️  Next Steps:
echo 1. Set up Supabase database tables (see SUPABASE_DEPLOYMENT.md)
echo 2. Update OAuth callback URLs in Google/GitHub console
echo 3. Add environment variables in Vercel dashboard:
echo    - SUPABASE_URL
echo    - SUPABASE_ANON_KEY
echo    - SUPABASE_SERVICE_KEY
echo    - GEMINI_API_KEY
echo    - Other API keys as needed
echo 4. Configure Supabase Auth providers
echo 5. Test your application
echo.
echo 📚 Full guide: SUPABASE_DEPLOYMENT.md
echo.
pause
