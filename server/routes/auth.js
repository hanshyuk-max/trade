const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Simple plaintext password check for demo as requested (mock was admin/1234)
        // In production, use bcrypt.compare(password, user.password_hash)

        const result = await db.query("SELECT * FROM users WHERE login_id = $1", [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password (again, simple check for now)
        if (user.password_hash !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ error: 'Account is not active' });
        }

        // Update last login
        await db.query("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1", [user.user_id]);

        // Remove sensitive info
        delete user.password_hash;

        res.json({
            user: {
                id: user.user_id,
                username: user.login_id,
                name: user.user_name,
                role: user.user_role
            },
            token: 'mock-jwt-token' // In real app, generate JWT here
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
