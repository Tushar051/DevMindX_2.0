#!/bin/bash

echo "========================================"
echo "Fixing Render MongoDB SSL Connection"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "Step 1: Checking git status..."
git status
echo ""

echo "Step 2: Adding changes..."
git add server/db.ts RENDER_MONGODB_SSL_FIX.md
echo ""

echo "Step 3: Committing fix..."
git commit -m "Fix: MongoDB SSL/TLS connection for Node.js v22 on Render"
echo ""

echo "Step 4: Pushing to GitHub..."
git push origin main
echo ""

echo "========================================"
echo "Fix deployed! Render will auto-deploy."
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Go to Render Dashboard"
echo "2. Check deployment logs"
echo "3. Look for 'Connected to MongoDB successfully'"
echo "4. Test your API endpoints"
echo ""
echo "If still failing, check RENDER_MONGODB_SSL_FIX.md"
echo "for additional troubleshooting steps."
echo ""
