@echo off
echo ========================================
echo DevMindX Production Fix Deployment
echo ========================================
echo.

echo Step 1: Committing fixes...
git add .
git commit -m "Fix production CORS and MongoDB connection issues"

echo.
echo Step 2: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Deployment initiated!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Render dashboard and verify backend is deploying
echo 2. Go to Vercel dashboard and verify frontend is deploying
echo 3. Set environment variables on Render (see PRODUCTION_FIX_GUIDE.md)
echo 4. Set environment variables on Vercel:
echo    - VITE_API_URL=https://devmindx.onrender.com
echo    - VITE_SOCKET_URL=https://devmindx.onrender.com
echo.
echo 5. Test the deployment:
echo    - Visit: https://devmindx.vercel.app
echo    - Check: https://devmindx.onrender.com/api/health
echo.
pause
