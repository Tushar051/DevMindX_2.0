@echo off
echo ========================================
echo Production Errors Fix - Deployment
echo ========================================
echo.

echo Step 1: Checking environment variables...
echo Make sure these are set in Vercel:
echo - MONGODB_URI
echo - GOOGLE_GEMINI_API_KEY
echo - SESSION_SECRET
echo - FRONTEND_URL
echo - ALLOWED_ORIGINS
echo - NODE_ENV=production
echo.

echo Step 2: Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please fix errors and try again.
    pause
    exit /b 1
)
echo.

echo Step 3: Committing changes...
git add .
git commit -m "Fix: Production API routing and database connection issues"
echo.

echo Step 4: Pushing to repository...
git push
if %errorlevel% neq 0 (
    echo Push failed! Please check your git configuration.
    pause
    exit /b 1
)
echo.

echo ========================================
echo Deployment initiated!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Vercel Dashboard
echo 2. Check deployment logs
echo 3. Verify environment variables are set
echo 4. Test these endpoints:
echo    - https://devmindx.vercel.app/api/health
echo    - https://devmindx.vercel.app/api/llm/models
echo    - https://devmindx.vercel.app/api/projects
echo.
echo See PRODUCTION_ERRORS_FIX.md for detailed testing checklist
echo.
pause
