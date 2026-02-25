@echo off
echo ========================================
echo Force Vercel Deployment
echo ========================================
echo.

echo This will trigger a new Vercel deployment
echo Make sure you have Vercel CLI installed: npm i -g vercel
echo.

echo Step 1: Login to Vercel
call vercel login

echo.
echo Step 2: Link to project (if not already linked)
call vercel link

echo.
echo Step 3: Deploy to production
call vercel --prod

echo.
echo ========================================
echo Deployment triggered!
echo Check your Vercel dashboard for status
echo ========================================
pause
