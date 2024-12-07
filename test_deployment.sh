#!/bin/bash

# Make scripts executable
chmod +x deploy_lftp.sh
chmod +x deploy_server.sh

# Deploy server first
echo "🚀 Deploying server..."
./deploy_server.sh

# Wait a moment for server deployment to complete
sleep 5

# Deploy front-end
echo "🚀 Deploying front-end..."
./deploy_lftp.sh

echo "✅ Full deployment complete!"

# Test API endpoint
echo "🧪 Testing API connection..."
curl -s https://mra.fih.mybluehost.me/hydro/server/api/attendees

echo "Done!"
