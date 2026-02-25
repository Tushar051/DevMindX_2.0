@echo off
echo ========================================
echo Vercel Environment Variables Setup
echo ========================================
echo.
echo This script will help you set up environment variables in Vercel.
echo.
echo IMPORTANT: You need to do this manually in Vercel Dashboard
echo because Vercel CLI requires authentication.
echo.
echo Step 1: Go to Vercel Dashboard
echo ----------------------------------------
echo URL: https://vercel.com/dashboard
echo.
echo Step 2: Select Your Project
echo ----------------------------------------
echo Click on your "devmindx" project
echo.
echo Step 3: Go to Settings
echo ----------------------------------------
echo Click "Settings" tab at the top
echo.
echo Step 4: Go to Environment Variables
echo ----------------------------------------
echo Click "Environment Variables" in the left sidebar
echo.
echo Step 5: Add These Variables
echo ----------------------------------------
echo.
echo CRITICAL - Database (Choose ONE):
echo.
echo Option A - MongoDB:
echo   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/devmindx
echo   MONGODB_DB = devmindx
echo   MONGODB_TLS = true
echo.
echo Option B - Supabase (you already have these):
echo   SUPABASE_URL = https://csexvydhnfulvfezqoit.supabase.co
echo   SUPABASE_ANON_KEY = sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
echo   SUPABASE_SERVICE_KEY = sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP
echo.
echo AI Services:
echo   GEMINI_API_KEY = AIzaSyCgPrayZtswmC0q9Meb8CLe-MvVYqlnrGU
echo   TOGETHER_API_KEY = c8cab5691fed977960bb96539b28ef07d56cba6abaa50f88f46b82552027bc5a
echo   CODESANDBOX_API_TOKEN = csb_v1_aqrKiblTMIUdE8Iq85n58L6SqR7AcHazALm9QXuc-Eg
echo.
echo Authentication:
echo   JWT_SECRET = QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM
echo   JWT_EXPIRATION = 86400000
echo   SESSION_SECRET = your_random_32_char_string_here
echo.
echo OAuth (IMPORTANT - Use Vercel URLs!):
echo   GOOGLE_CLIENT_ID = 692286091038-bdol7pqup20k9mv98jgk4icijkhmoa8o.apps.googleusercontent.com
echo   GOOGLE_CLIENT_SECRET = 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
echo   GOOGLE_CALLBACK_URL = https://devmindx.vercel.app/api/auth/google/callback
echo.
echo   GITHUB_CLIENT_ID = Ov23li1DxFPHl6zgI6zE
echo   GITHUB_CLIENT_SECRET = afbe9fbc6db18f06f7ca89c5f3180e645f4dbac1
echo   GITHUB_CALLBACK_URL = https://devmindx.vercel.app/api/auth/github/callback
echo.
echo Email:
echo   EMAIL_USER = webdevx.ai@gmail.com
echo   EMAIL_PASS = hjowcklyhohvanfe
echo   FORCE_EMAIL = true
echo.
echo URLs:
echo   FRONTEND_URL = https://devmindx.vercel.app
echo   ALLOWED_ORIGINS = https://devmindx.vercel.app
echo.
echo Environment:
echo   NODE_ENV = production
echo   PORT = 5000
echo.
echo ========================================
echo.
echo Step 6: Update OAuth Redirect URIs
echo ----------------------------------------
echo.
echo Google OAuth Console:
echo   1. Go to: https://console.cloud.google.com/apis/credentials
echo   2. Find your OAuth 2.0 Client ID
echo   3. Update Authorized redirect URIs to:
echo      https://devmindx.vercel.app/api/auth/google/callback
echo.
echo GitHub OAuth Settings:
echo   1. Go to: https://github.com/settings/developers
echo   2. Find your OAuth App
echo   3. Update Authorization callback URL to:
echo      https://devmindx.vercel.app/api/auth/github/callback
echo.
echo ========================================
echo.
echo Step 7: Redeploy
echo ----------------------------------------
echo After setting all variables, redeploy your app:
echo   - Go to Vercel Dashboard ^> Deployments
echo   - Click "Redeploy" on the latest deployment
echo.
echo OR push a new commit:
echo   git commit --allow-empty -m "Trigger deployment"
echo   git push
echo.
echo ========================================
echo.
echo See VERCEL_ONLY_SETUP.md for detailed instructions
echo.
pause
