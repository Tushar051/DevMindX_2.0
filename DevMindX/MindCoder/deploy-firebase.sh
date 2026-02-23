#!/bin/bash

# DevMindX Firebase Deployment Script
# This script automates the deployment process to Firebase and Google Cloud Run

set -e  # Exit on error

echo "🚀 DevMindX Firebase Deployment"
echo "================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found."
    echo "Please install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Login to Firebase
echo "🔐 Logging in to Firebase..."
firebase login

# Login to Google Cloud
echo "🔐 Logging in to Google Cloud..."
gcloud auth login

# Set project
echo "📦 Setting up Firebase project..."
read -p "Enter your Firebase project ID (or press Enter to use 'devmindx-project'): " PROJECT_ID
PROJECT_ID=${PROJECT_ID:-devmindx-project}

firebase use $PROJECT_ID || firebase use --add

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy frontend to Firebase Hosting
echo "🌐 Deploying frontend to Firebase Hosting..."
firebase deploy --only hosting

# Deploy backend to Cloud Run
echo "☁️  Deploying backend to Cloud Run..."
read -p "Enter Cloud Run service name (or press Enter to use 'devmindx-backend'): " SERVICE_NAME
SERVICE_NAME=${SERVICE_NAME:-devmindx-backend}

gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

# Get the Cloud Run URL
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region us-central1 --format 'value(status.url)')

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo ""
echo "Frontend URL: https://$PROJECT_ID.web.app"
echo "Backend URL: $BACKEND_URL"
echo ""
echo "⚠️  Next Steps:"
echo "1. Update OAuth callback URLs in Google/GitHub console"
echo "2. Set environment variables in Cloud Run:"
echo "   gcloud run services update $SERVICE_NAME --set-env-vars MONGODB_URI=your_uri,JWT_SECRET=your_secret"
echo "3. Update firebase.json with your Cloud Run service name"
echo "4. Test your application"
echo ""
