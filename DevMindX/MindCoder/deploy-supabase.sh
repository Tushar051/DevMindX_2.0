#!/bin/bash

# DevMindX Supabase + Vercel Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 DevMindX Supabase Deployment"
echo "================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

# Build the application
echo "🔨 Building application..."
npm run build

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
echo "1. Set up Supabase database tables (see SUPABASE_DEPLOYMENT.md)"
echo "2. Update OAuth callback URLs in Google/GitHub console"
echo "3. Add environment variables in Vercel dashboard:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_KEY"
echo "   - GEMINI_API_KEY"
echo "   - Other API keys as needed"
echo "4. Configure Supabase Auth providers"
echo "5. Test your application"
echo ""
echo "📚 Full guide: SUPABASE_DEPLOYMENT.md"
echo ""
