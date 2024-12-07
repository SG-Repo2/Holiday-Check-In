const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class PhotoSession {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM photo_sessions');
        return rows;
    }

    static async getByAttendeeId(attendeeId) {
        const [rows] = await pool.query('SELECT * FROM photo_sessions WHERE attendeeId = ?', [attendeeId]);
        return rows[0];
    }

    static async create(sessionData) {
        const id = uuidv4();
        const {
            attendeeId,
            timeSlot,
            email,
            status,
            notes,
            totalParticipants,
            completedAt
        } = sessionData;

        const [result] = await pool.query(
            'INSERT INTO photo_sessions (id, attendeeId, timeSlot, email, status, notes, totalParticipants, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, attendeeId, timeSlot, email, status, notes, totalParticipants, completedAt]
        );

        return { id, ...sessionData };
    }

    static async update(id, sessionData) {
        const [result] = await pool.query(
            'UPDATE photo_sessions SET ? WHERE id = ?',
            [sessionData, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM photo_sessions WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = PhotoSession;
