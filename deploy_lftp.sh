#!/bin/bash

# Configuration
FTP_USER="cg-1cb3ddc1fefd3ca4@mra.fih.mybluehost.me"
FTP_PASS="Z1J7QV8irC25"
FTP_HOST="mra.fih.mybluehost.me"
REMOTE_PATH="/public_html/hydro"
LOCAL_BUILD_PATH="./build"

# Ensure script stops on any error
set -e

echo "🚀 Starting deployment to Bluehost..."

# Create production environment file
echo "📝 Creating production environment file..."
cat << EOF > .env.production
REACT_APP_API_URL=https://chiwebdev.com/hydro/server/api
EOF

# Build the project
echo "📦 Building the project..."
npm run build

# Create lftp script with SSL configuration
echo "📝 Creating LFTP script..."
cat << EOF > lftp_commands.txt
set ssl:verify-certificate no
set ftp:ssl-force true
set ftp:ssl-protect-data true
open -u "$FTP_USER","$FTP_PASS" $FTP_HOST
cd $REMOTE_PATH
mirror -R $LOCAL_BUILD_PATH/ .
bye
EOF

# Upload files using lftp
echo "📤 Uploading files to Bluehost..."
lftp -f lftp_commands.txt

# Clean up
rm lftp_commands.txt

echo "✅ Deployment complete!"
