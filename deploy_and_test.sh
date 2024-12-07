#!/bin/bash

# Make scripts executable
chmod +x deploy_lftp.sh
chmod +x deploy_server.sh

# Test database connection first
echo "🔍 Testing database connection..."
node server/test-db.js

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed! Aborting deployment."
    exit 1
fi

# Deploy server first
echo "🚀 Deploying server..."
./deploy_server.sh

# Wait a moment for server deployment to complete
sleep 5

# Deploy front-end
echo "🚀 Deploying front-end..."
./deploy_lftp.sh

echo "🧪 Testing API endpoint..."
curl -s https://chiwebdev.com/hydro/server/api/attendees

# Final verification
echo "🔍 Verifying deployment..."
curl -s -I https://chiwebdev.com/hydro/ | head -n 1
curl -s -I https://chiwebdev.com/hydro/server/api/attendees | head -n 1

echo "✅ Deployment and testing complete!"
