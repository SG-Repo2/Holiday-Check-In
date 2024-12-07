#!/bin/bash

# Configuration
FTP_USER="cg-1cb3ddc1fefd3ca4@mra.fih.mybluehost.me"
FTP_PASS="Z1J7QV8irC25"
FTP_HOST="mra.fih.mybluehost.me"
REMOTE_PATH="/public_html/hydro/server"
LOCAL_SERVER_PATH="./server"

# Ensure script stops on any error
set -e

echo "🚀 Starting server deployment to Bluehost..."

# Create production .env file
cat << EOF > ./server/.env
DB_HOST=chiwebdev.com
DB_USER=mrafihmy_user
DB_PASSWORD=@NhwphY&(YMB
DB_NAME=mrafihmy_hydrodb
PORT=3001
NODE_ENV=production
EOF

# Create lftp script with SSL configuration
echo "📝 Creating LFTP script..."
cat << EOF > lftp_commands.txt
set ssl:verify-certificate no
set ftp:ssl-force true
set ftp:ssl-protect-data true
open -u "$FTP_USER","$FTP_PASS" $FTP_HOST
cd $REMOTE_PATH
mirror -R $LOCAL_SERVER_PATH/ .
bye
EOF

# Upload files using lftp
echo "📤 Uploading server files to Bluehost..."
lftp -f lftp_commands.txt

# Clean up
rm lftp_commands.txt

echo "✅ Server deployment complete!"
