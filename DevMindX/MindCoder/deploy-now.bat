@echo off
echo Deploying to Vercel...
cd /d "%~dp0"
call npx vercel --prod --yes
echo.
echo Deployment complete!
pause
