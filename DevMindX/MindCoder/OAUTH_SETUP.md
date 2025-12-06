# OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for DevMindX.

## Prerequisites

- A Google account (for Google OAuth)
- A GitHub account (for GitHub OAuth)

## Step 1: Create a .env file

Create a `.env` file in the root directory (`DevMindX/MindCoder/.env`) with the following content:

```env
# OAuth Configuration
# You need to set up OAuth applications in Google Cloud Console and GitHub Developer Settings

# Google OAuth (Required for Google Sign-in)
# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# GitHub OAuth (Required for GitHub Sign-in)
# Get these from: https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Database Configuration
DATABASE_URL=sqlite:./dev.db

# JWT Secret (Change this in production)
JWT_SECRET=your_jwt_secret_here

# Email Configuration (for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# Environment
NODE_ENV=development
```

## Step 2: Set up Google OAuth

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

### 2.2 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add the following authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (if using Vite dev server)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### 2.3 Update .env file

Replace the Google OAuth values in your `.env` file:

```env
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
```

## Step 3: Set up GitHub OAuth

### 3.1 Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: DevMindX
   - **Homepage URL**: `http://localhost:5000`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### 3.2 Update .env file

Replace the GitHub OAuth values in your `.env` file:

```env
GITHUB_CLIENT_ID=your_actual_github_client_id
GITHUB_CLIENT_SECRET=your_actual_github_client_secret
```

## Step 4: Set up Email (Optional)

For OTP verification emails, you'll need to configure SMTP:

### 4.1 Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
3. Update the email configuration in your `.env` file:

```env
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Step 5: Restart the Server

After setting up your `.env` file:

1. Stop the development server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```

## Step 6: Test OAuth

1. Open your application in the browser
2. Try signing up/signing in with Google or GitHub
3. You should be redirected to the OAuth provider and then back to your app

## Troubleshooting

### "Google OAuth not configured" Error

This means your `.env` file is missing or the Google OAuth credentials are not set correctly.

**Solution:**
1. Make sure you have a `.env` file in the `DevMindX/MindCoder/` directory
2. Verify that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
3. Restart the server after making changes

### "GitHub OAuth not configured" Error

This means your `.env` file is missing or the GitHub OAuth credentials are not set correctly.

**Solution:**
1. Make sure you have a `.env` file in the `DevMindX/MindCoder/` directory
2. Verify that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set correctly
3. Restart the server after making changes

### Redirect URI Mismatch Error

This happens when the callback URL in your OAuth app doesn't match the one in your `.env` file.

**Solution:**
1. Check that the callback URLs in your Google/GitHub OAuth apps match exactly:
   - Google: `http://localhost:5000/api/auth/google/callback`
   - GitHub: `http://localhost:5000/api/auth/github/callback`
2. Make sure there are no extra spaces or characters

### "Invalid redirect_uri" Error

This usually means the redirect URI in your OAuth app settings doesn't match what the application is sending.

**Solution:**
1. Double-check the callback URLs in your OAuth app settings
2. Make sure you're using the correct port (5000 for the server)
3. If using a different port, update both the OAuth app settings and the `.env` file

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique secrets for production
- Regularly rotate your OAuth client secrets
- Use HTTPS in production and update callback URLs accordingly

## Production Deployment

When deploying to production:

1. Update all callback URLs to use your production domain
2. Set `NODE_ENV=production`
3. Use a strong, unique `JWT_SECRET`
4. Configure proper SMTP settings for production
5. Use HTTPS for all OAuth callbacks
