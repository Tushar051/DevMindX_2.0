#!/bin/bash

# DevMindX Vercel Deployment Script
# This script automates the deployment process to Vercel

set -e  # Exit on error

echo "🚀 DevMindX Vercel Deployment"
echo "================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

# Get the deployment URL
DEPLOYMENT_URL=$(vercel ls --prod | grep -o 'https://[^ ]*' | head -1)

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo ""
echo "Deployment URL: $DEPLOYMENT_URL"
echo ""
echo "⚠️  Next Steps:"
echo "1. Update OAuth callback URLs:"
echo "   - Google: https://console.cloud.google.com"
echo "   - GitHub: https://github.com/settings/developers"
echo "2. Update environment variables in Vercel dashboard:"
echo "   - GOOGLE_CALLBACK_URL"
echo "   - GITHUB_CALLBACK_URL"
echo "3. Redeploy if you updated environment variables"
echo "4. Test your application"
echo ""
echo "📚 Full guide: VERCEL_COMPLETE_DEPLOYMENT.md"
echo ""
