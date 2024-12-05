const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true // Allow multiple SQL statements
});

// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    console.log('Testing database connection with settings:');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306
    });
    
    console.log('Connection successful!');
    const [rows] = await connection.query('SELECT 1 as test');
    await connection.end();
    
    res.json({ 
      message: 'Database connection successful',
      test: rows[0].test
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  }
});

// Attendees endpoints
app.get('/api/attendees', async (req, res) => {
  try {
    const [attendees] = await pool.query('SELECT * FROM attendees');
    const [children] = await pool.query('SELECT * FROM children');
    
    // Combine attendees with their children
    const attendeesWithChildren = attendees.map(attendee => ({
      ...attendee,
      children: children.filter(child => child.attendeeId === attendee.id)
    }));
    
    res.json(attendeesWithChildren);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  }
});

app.post('/api/attendees', async (req, res) => {
  try {
    const { id, firstName, lastName, email, photographyTimeSlot, children } = req.body;
    
    // Insert attendee
    await pool.query(
      'INSERT INTO attendees (id, firstName, lastName, email, photographyTimeSlot) VALUES (?, ?, ?, ?, ?)',
      [id, firstName, lastName, email, photographyTimeSlot]
    );
    
    // Insert children if any
    if (children && children.length > 0) {
      for (const child of children) {
        await pool.query(
          'INSERT INTO children (id, attendeeId, name, age, gender, verified) VALUES (?, ?, ?, ?, ?, ?)',
          [child.id, id, child.name, child.age, child.gender, child.verified || false]
        );
      }
    }
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error creating attendee:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  }
});

app.put('/api/attendees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, photographyTimeSlot, photographyStatus, notes, checkedIn, children } = req.body;
    
    // Update attendee
    await pool.query(
      `UPDATE attendees SET 
        firstName = ?, 
        lastName = ?, 
        email = ?, 
        photographyTimeSlot = ?,
        photographyStatus = ?,
        notes = ?,
        checkedIn = ?
      WHERE id = ?`,
      [firstName, lastName, email, photographyTimeSlot, photographyStatus, notes, checkedIn, id]
    );
    
    // Update children
    if (children) {
      // First, remove all existing children
      await pool.query('DELETE FROM children WHERE attendeeId = ?', [id]);
      
      // Then insert the updated children
      for (const child of children) {
        await pool.query(
          'INSERT INTO children (id, attendeeId, name, age, gender, verified) VALUES (?, ?, ?, ?, ?, ?)',
          [child.id, id, child.name, child.age, child.gender, child.verified || false]
        );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating attendee:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  }
});

// Photo Sessions endpoints
app.get('/api/photo-sessions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM photo_sessions');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching photo sessions:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  }
});

app.post('/api/photo-sessions', async (req, res) => {
  try {
    const { id, attendeeId, timeSlot, email, status, notes, totalParticipants } = req.body;
    await pool.query(
      'INSERT INTO photo_sessions (id, attendeeId, timeSlot, email, status, notes, totalParticipants) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, attendeeId, timeSlot, email, status, notes, totalParticipants]
    );
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error creating photo session:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  }
});

const PORT = process.env.PORT || 3306;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
