const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Attendee {
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                GROUP_CONCAT(DISTINCT c.id, ':', c.name, ':', IFNULL(c.age, ''), ':', IFNULL(c.gender, '')) as children,
                ps.timeSlot as photographyTimeSlot,
                ps.status as photographyStatus,
                ps.email as photographyEmail
            FROM attendees a
            LEFT JOIN children c ON a.id = c.attendeeId
            LEFT JOIN photo_sessions ps ON a.id = ps.attendeeId
            GROUP BY a.id
        `);

        // Process the results to format children data
        return rows.map(row => {
            const attendee = { ...row };
            if (row.children) {
                attendee.children = row.children.split(',').map(child => {
                    const [id, name, age, gender] = child.split(':');
                    return { id, name, age: age || null, gender: gender ||null  };
                });
            } else {
                attendee.children = [];
            }
            delete attendee.children_data;
            return attendee;
        });
    }

    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                GROUP_CONCAT(DISTINCT c.id, ':', c.name, ':', IFNULL(c.age, ''), ':', IFNULL(c.gender, '')) as children,
                ps.timeSlot as photographyTimeSlot,
                ps.status as photographyStatus,
                ps.email as photographyEmail
            FROM attendees a
            LEFT JOIN children c ON a.id = c.attendeeId
            LEFT JOIN photo_sessions ps ON a.id = ps.attendeeId
            WHERE a.id = ?
            GROUP BY a.id
        `, [id]);

        if (rows.length === 0) return null;

        const attendee = { ...rows[0] };
        if (attendee.children) {
            attendee.children = attendee.children.split(',').map(child => {
                const [id, name, age, gender] = child.split(':');
                return { id, name, age: age || null, gender: gender || null };
            });
        } else {
            attendee.children = [];
        }
        delete attendee.children_data;
        return attendee;
    }

    static async create(attendeeData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Check for duplicate email if provided
            if (attendeeData.email) {
                const [existing] = await connection.query(
                    'SELECT id FROM attendees WHERE email = ? AND email != ""',
                    [attendeeData.email]
                );
                if (existing.length > 0) {
                    throw new Error('Email already exists');
                }
            }

            const id = uuidv4();
            const {
                firstName,
                lastName,
                email,
                photographyTimeSlot,
                photographyStatus,
                photographyEmail,
                notes,
                checkedIn
            } = attendeeData;

            await connection.query(
                'INSERT INTO attendees (id, firstName, lastName, email, notes, checkedIn) VALUES (?, ?, ?, ?, ?, ?)',
                [id, firstName, lastName, email || '', notes || '', checkedIn || false]
            );

            if (photographyTimeSlot || photographyStatus || photographyEmail) {
                await connection.query(
                    'INSERT INTO photo_sessions (id, attendeeId, timeSlot, status, email) VALUES (?, ?, ?, ?, ?)',
                    [uuidv4(), id, photographyTimeSlot, photographyStatus || 'pending', photographyEmail || email || '']
                );
            }

            await connection.commit();
            return this.getById(id);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async update(id, attendeeData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Check for duplicate email if email is being updated
            if (attendeeData.email) {
                const [existing] = await connection.query(
                    'SELECT id FROM attendees WHERE email = ? AND id != ? AND email != ""',
                    [attendeeData.email, id]
                );
                if (existing.length > 0) {
                    throw new Error('Email already exists');
                }
            }

            // Update attendee
            await connection.query(
                'UPDATE attendees SET ? WHERE id = ?',
                [attendeeData, id]
            );

            // Update photo session if provided
            if (attendeeData.photographyTimeSlot || attendeeData.photographyStatus || attendeeData.photographyEmail) {
                const [existing] = await connection.query(
                    'SELECT id FROM photo_sessions WHERE attendeeId = ?',
                    [id]
                );

                const photoData = {
                    timeSlot: attendeeData.photographyTimeSlot,
                    status: attendeeData.photographyStatus,
                    email: attendeeData.photographyEmail || attendeeData.email
                };

                if (existing.length > 0) {
                    await connection.query(
                        'UPDATE photo_sessions SET ? WHERE attendeeId = ?',
                        [photoData, id]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO photo_sessions (id, attendeeId, timeSlot, status, email) VALUES (?, ?, ?, ?, ?)',
                        [uuidv4(), id, photoData.timeSlot, photoData.status, photoData.email]
                    );
                }
            }

            await connection.commit();
            return this.getById(id);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // Delete photo sessions first (due to foreign key)
            await connection.query('DELETE FROM photo_sessions WHERE attendeeId = ?', [id]);
            
            // Delete children (due to foreign key)
            await connection.query('DELETE FROM children WHERE attendeeId = ?', [id]);
            
            // Delete attendee
            const [result] = await connection.query('DELETE FROM attendees WHERE id = ?', [id]);
            
            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Attendee;
