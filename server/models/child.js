const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Child {
    static async getAllByAttendeeId(attendeeId) {
        const [rows] = await pool.query('SELECT * FROM children WHERE attendeeId = ?', [attendeeId]);
        return rows;
    }

    static async create(childData) {
        const id = uuidv4();
        const { attendeeId, name, age, gender, verified } = childData;

        const [result] = await pool.query(
            'INSERT INTO children (id, attendeeId, name, age, gender, verified) VALUES (?, ?, ?, ?, ?, ?)',
            [id, attendeeId, name, age, gender, verified]
        );

        return { id, ...childData };
    }

    static async update(id, childData) {
        const [result] = await pool.query(
            'UPDATE children SET ? WHERE id = ?',
            [childData, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM children WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Child;
