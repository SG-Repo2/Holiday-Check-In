require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

    console.log('Testing database connection with config:', {
        host: config.host,
        user: config.user,
        database: config.database
    });

    try {
        const connection = await mysql.createConnection(config);
        console.log('Successfully connected to database!');
        
        // Test query
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Database tables:', rows);

        // Test attendees table
        const [attendees] = await connection.execute('SELECT COUNT(*) as count FROM attendees');
        console.log('Number of attendees:', attendees[0].count);

        await connection.end();
        console.log('Connection closed successfully');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

testConnection();
