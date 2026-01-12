const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to check if user is admin (simplified for now)
const isAdmin = (req, res, next) => {
    // In real app, check req.user.role from JWT
    // For now, we'll assume the client sends a role header or we trust the implementation
    // This is a placeholder. Real auth middleware comes later.
    next();
};

// GET /api/users - List users
router.get('/', async (req, res) => {
    try {
        // Check for admin role logic would go here.
        // For now, returning all for Admin.
        // If not admin, should return 403 or only self.

        // We will filter in the query based on the requester's role in a real world scenario
        const result = await db.query('SELECT user_id, login_id, email, user_name, nickname, status, user_role, created_at, last_login_at FROM users ORDER BY user_id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/users/:id - Get single user
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT user_id, login_id, email, user_name, nickname, status, user_role, created_at FROM users WHERE user_id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_name, nickname, email, user_role, status } = req.body;

        // Validation: Only allow changing role/status if Admin

        const result = await db.query(
            `UPDATE users 
             SET user_name = COALESCE($1, user_name),
                 nickname = COALESCE($2, nickname),
                 email = COALESCE($3, email),
                 user_role = COALESCE($4, user_role),
                 status = COALESCE($5, status)
             WHERE user_id = $6
             RETURNING *`,
            [user_name, nickname, email, user_role, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/users/:id - Soft Delete
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            "UPDATE users SET status = 'WITHDRAWN', deleted_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
