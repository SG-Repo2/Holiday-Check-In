require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
const backupDatabase = require('./backup-db');
const path = require('path');
const fs = require('fs').promises;

class DatabaseManager {
    constructor() {
        this.config = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10
        };
        this.pool = mysql.createPool(this.config);
    }

    async validateData() {
        try {
            const connection = await this.pool.getConnection();
            logger.info('Running data validation checks...');

            // Check for data integrity
            const validations = [
                // Check for orphaned children records
                `SELECT c.* FROM children c 
                LEFT JOIN attendees a ON c.attendeeId = a.id 
                WHERE a.id IS NULL`,

                // Check for orphaned photo sessions
                `SELECT ps.* FROM photo_sessions ps 
                LEFT JOIN attendees a ON ps.attendeeId = a.id 
                WHERE a.id IS NULL`,

                // Check for duplicate email addresses
                `SELECT email, COUNT(*) as count 
                FROM attendees 
                WHERE email != '' 
                GROUP BY email 
                HAVING count > 1`,

                // Check for invalid dates
                `SELECT * FROM photo_sessions 
                WHERE completedAt > NOW()`
            ];

            const issues = [];
            for (const query of validations) {
                const [rows] = await connection.query(query);
                if (rows.length > 0) {
                    issues.push({ query, results: rows });
                }
            }

            connection.release();

            if (issues.length > 0) {
                logger.warn('Data validation issues found:', { issues });
                return false;
            }

            logger.info('Data validation passed successfully');
            return true;
        } catch (error) {
            logger.error('Error during data validation:', error);
            throw error;
        }
    }

    async getDatabaseStats() {
        try {
            const connection = await this.pool.getConnection();
            const stats = {
                attendees: 0,
                children: 0,
                photoSessions: 0,
                checkedIn: 0,
                withChildren: 0,
                withPhotoSessions: 0
            };

            // Get counts
            const queries = {
                attendees: 'SELECT COUNT(*) as count FROM attendees',
                children: 'SELECT COUNT(*) as count FROM children',
                photoSessions: 'SELECT COUNT(*) as count FROM photo_sessions',
                checkedIn: 'SELECT COUNT(*) as count FROM attendees WHERE checkedIn = true',
                withChildren: 'SELECT COUNT(DISTINCT attendeeId) as count FROM children',
                withPhotoSessions: 'SELECT COUNT(DISTINCT attendeeId) as count FROM photo_sessions'
            };

            for (const [key, query] of Object.entries(queries)) {
                const [rows] = await connection.query(query);
                stats[key] = rows[0].count;
            }

            connection.release();
            return stats;
        } catch (error) {
            logger.error('Error getting database stats:', error);
            throw error;
        }
    }

    async performMaintenance() {
        try {
            const connection = await this.pool.getConnection();
            logger.info('Starting database maintenance...');

            // Optimize tables
            const tables = ['attendees', 'children', 'photo_sessions'];
            for (const table of tables) {
                await connection.query(`OPTIMIZE TABLE ${table}`);
            }

            // Analyze tables
            for (const table of tables) {
                await connection.query(`ANALYZE TABLE ${table}`);
            }

            connection.release();
            logger.info('Database maintenance completed');
        } catch (error) {
            logger.error('Error during maintenance:', error);
            throw error;
        }
    }

    async scheduleBackup() {
        try {
            const stats = await this.getDatabaseStats();
            logger.info('Current database stats:', stats);

            // Perform backup
            const backupPath = await backupDatabase();
            logger.info('Backup created:', backupPath);

            // Validate data after backup
            const isValid = await this.validateData();
            if (!isValid) {
                logger.warn('Data validation failed after backup');
            }

            return {
                backupPath,
                stats,
                isValid
            };
        } catch (error) {
            logger.error('Error during scheduled backup:', error);
            throw error;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const manager = new DatabaseManager();
    
    async function runMaintenance() {
        try {
            // Get initial stats
            const beforeStats = await manager.getDatabaseStats();
            logger.info('Database stats before maintenance:', beforeStats);

            // Run maintenance
            await manager.performMaintenance();

            // Validate data
            await manager.validateData();

            // Create backup
            await manager.scheduleBackup();

            // Get final stats
            const afterStats = await manager.getDatabaseStats();
            logger.info('Database stats after maintenance:', afterStats);

            process.exit(0);
        } catch (error) {
            logger.error('Maintenance failed:', error);
            process.exit(1);
        }
    }

    runMaintenance();
}

module.exports = DatabaseManager;
