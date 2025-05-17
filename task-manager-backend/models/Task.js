const pool = require('../config/db');

class Task {
    static async create(userId, title, description, priority, deadline, reminder) {
        const [result] = await pool.query(
            'INSERT INTO tasks (user_id, title, description, priority, deadline, reminder) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, description, priority, deadline, reminder]
        );
        return result.insertId;
    }

    static async findByUser(userId) {
        const [rows] = await pool.query('SELECT * FROM tasks WHERE user_id = ?', [userId]);
        return rows;
    }

    static async update(id, title, description, priority, deadline, reminder) {
        await pool.query(
            'UPDATE tasks SET title = ?, description = ?, priority = ?, deadline = ?, reminder = ? WHERE id = ?',
            [title, description, priority, deadline, reminder, id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    }
}

module.exports = Task;