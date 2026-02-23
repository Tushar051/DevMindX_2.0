@echo off
echo ========================================
echo DevMindX Modern Design Setup
echo ========================================
echo.

cd MindCoder

echo [1/3] Installing new dependencies...
call npm install gsap @gsap/react lenis react-spring @tabler/icons-react simplex-noise

echo.
echo [2/3] Checking existing dependencies...
call npm install

echo.
echo [3/3] Setup complete!
echo.
echo ========================================
echo Ready to run!
echo ========================================
echo.
echo To start the development server:
echo   npm run dev
echo.
echo Then visit: http://localhost:5000
echo.
pause
