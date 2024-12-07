#!/bin/bash

# Configuration
FTP_USER="cg-1cb3ddc1fefd3ca4@mra.fih.mybluehost.me"
FTP_PASS="Z1J7QV8irC25"
FTP_HOST="mra.fih.mybluehost.me"
REMOTE_PATH="/public_html/hydro/server"
LOCAL_SERVER_PATH="./server"

# Ensure script stops on any error
set -e

echo "🚀 Starting backend deployment to Bluehost..."

# Create temporary directory for deployment
echo "📦 Preparing deployment package..."
rm -rf deploy_tmp
mkdir -p deploy_tmp/api
mkdir -p deploy_tmp/data

# Copy necessary files
cp $LOCAL_SERVER_PATH/api/index.php deploy_tmp/api/
cp $LOCAL_SERVER_PATH/../src/attendees2024.json deploy_tmp/data/attendees.json

# Create .htaccess for API
echo "📝 Creating .htaccess..."
cat << EOF > deploy_tmp/api/.htaccess
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
EOF

# Create .htaccess for data directory
cat << EOF > deploy_tmp/data/.htaccess
Deny from all
EOF

# Create lftp script
echo "📝 Creating LFTP script..."
cat << EOF > lftp_commands_backend.txt
set ssl:verify-certificate no
set ftp:ssl-force true
set ftp:ssl-protect-data true
open -u "$FTP_USER","$FTP_PASS" $FTP_HOST
cd /public_html/hydro
mirror --reverse --delete --verbose deploy_tmp/ server/
chmod 755 server/api
chmod 644 server/api/index.php
chmod 755 server/data
chmod 644 server/data/attendees.json
bye
EOF

# Deploy using lftp
echo "� Deploying to server..."
lftp -f lftp_commands_backend.txt

# Cleanup
echo "🧹 Cleaning up..."
rm -rf deploy_tmp
rm lftp_commands_backend.txt

echo "✅ Backend deployment complete!"
