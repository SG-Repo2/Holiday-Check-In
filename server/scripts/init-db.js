require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const logger = require('../utils/logger');

async function readJsonFile() {
    try {
        const jsonPath = path.join(__dirname, '../../src/attendees2024.json');
        const data = await fs.readFile(jsonPath, 'utf8');
        return JSON.parse(data).attendees;
    } catch (error) {
        logger.error('Error reading JSON file:', error);
        throw error;
    }
}

async function initializeDatabase() {
    let connection;
    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        logger.info('Connected to database');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        await connection.query(schema);
        logger.info('Schema created successfully');

        // Read JSON data
        const attendees = await readJsonFile();
        logger.info(`Read ${attendees.length} attendees from JSON`);

        // Insert attendees
        for (const attendee of attendees) {
            const attendeeId = uuidv4();
            
            // Insert attendee
            await connection.query(
                'INSERT INTO attendees (id, firstName, lastName, email, notes, checkedIn) VALUES (?, ?, ?, ?, ?, ?)',
                [attendeeId, attendee.firstName, attendee.lastName, attendee.email, attendee.notes, attendee.checkedIn]
            );

            // Insert children if any
            if (attendee.children && attendee.children.length > 0) {
                for (const child of attendee.children) {
                    await connection.query(
                        'INSERT INTO children (id, attendeeId, name, age, gender, verified) VALUES (?, ?, ?, ?, ?, ?)',
                        [uuidv4(), attendeeId, child.name, child.age || null, child.gender || null, false]
                    );
                }
            }

            // Insert photo session if exists
            if (attendee.photographyTimeSlot || attendee.photographyStatus) {
                await connection.query(
                    'INSERT INTO photo_sessions (id, attendeeId, timeSlot, email, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                        uuidv4(),
                        attendeeId,
                        attendee.photographyTimeSlot || null,
                        attendee.photographyEmail || null,
                        attendee.photographyStatus || 'pending',
                        null
                    ]
                );
            }
        }

        logger.info('Database initialized successfully');

        // Verify data
        const [attendeeCount] = await connection.query('SELECT COUNT(*) as count FROM attendees');
        const [childrenCount] = await connection.query('SELECT COUNT(*) as count FROM children');
        const [sessionCount] = await connection.query('SELECT COUNT(*) as count FROM photo_sessions');

        logger.info('Data verification:', {
            attendees: attendeeCount[0].count,
            children: childrenCount[0].count,
            photoSessions: sessionCount[0].count
        });

    } catch (error) {
        logger.error('Error initializing database:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            logger.info('Database connection closed');
        }
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            logger.info('Database initialization completed successfully');
            process.exit(0);
        })
        .catch(error => {
            logger.error('Database initialization failed:', error);
            process.exit(1);
        });
}

module.exports = initializeDatabase;
