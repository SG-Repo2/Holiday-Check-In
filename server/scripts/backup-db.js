require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

async function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);

    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    const command = `mysqldump -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${filepath}`;

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup error: ${error}`);
                reject(error);
                return;
            }
            console.log(`Database backup created: ${filepath}`);
            resolve(filepath);
        });
    });
}

// Run backup if called directly
if (require.main === module) {
    backupDatabase().catch(console.error);
}

module.exports = backupDatabase;