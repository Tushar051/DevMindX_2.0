@echo off
REM DevMindX Firebase Deployment Script for Windows
REM This script automates the deployment process to Firebase and Google Cloud Run

echo.
echo 🚀 DevMindX Firebase Deployment
echo ================================
echo.

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Firebase CLI not found. Installing...
    call npm install -g firebase-tools
)

REM Check if gcloud CLI is installed
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Google Cloud CLI not found.
    echo Please install from: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Login to Firebase
echo 🔐 Logging in to Firebase...
call firebase login

REM Login to Google Cloud
echo 🔐 Logging in to Google Cloud...
call gcloud auth login

REM Set project
echo 📦 Setting up Firebase project...
set /p PROJECT_ID="Enter your Firebase project ID (or press Enter to use 'devmindx-project'): "
if "%PROJECT_ID%"=="" set PROJECT_ID=devmindx-project

call firebase use %PROJECT_ID% || call firebase use --add

REM Build the application
echo 🔨 Building application...
call npm run build

REM Deploy frontend to Firebase Hosting
echo 🌐 Deploying frontend to Firebase Hosting...
call firebase deploy --only hosting

REM Deploy backend to Cloud Run
echo ☁️  Deploying backend to Cloud Run...
set /p SERVICE_NAME="Enter Cloud Run service name (or press Enter to use 'devmindx-backend'): "
if "%SERVICE_NAME%"=="" set SERVICE_NAME=devmindx-backend

call gcloud run deploy %SERVICE_NAME% --source . --platform managed --region us-central1 --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --timeout 300 --max-instances 10

REM Get the Cloud Run URL
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region us-central1 --format "value(status.url)"') do set BACKEND_URL=%%i

echo.
echo ✅ Deployment Complete!
echo =======================
echo.
echo Frontend URL: https://%PROJECT_ID%.web.app
echo Backend URL: %BACKEND_URL%
echo.
echo ⚠️  Next Steps:
echo 1. Update OAuth callback URLs in Google/GitHub console
echo 2. Set environment variables in Cloud Run:
echo    gcloud run services update %SERVICE_NAME% --set-env-vars MONGODB_URI=your_uri,JWT_SECRET=your_secret
echo 3. Update firebase.json with your Cloud Run service name
echo 4. Test your application
echo.
pause
