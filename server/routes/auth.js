const express = require('express');
const router = express.Router();
const db = require('../db');

console.log("Loading auth routes...");

router.post('/register', async (req, res) => {
    const { login_id, password, email, user_name, phone_number } = req.body;

    try {
        // Check if user exists
        const userCheck = await db.query(
            "SELECT * FROM users WHERE login_id = $1 OR email = $2",
            [login_id, email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Username or Email already exists' });
        }

        // Insert new user with PENDING status (default in schema)
        // In production, password should be hashed
        const newUser = await db.query(
            `INSERT INTO users (login_id, password_hash, email, user_name, phone_number)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING user_id, login_id, user_name, status`,
            [login_id, password, email, user_name, phone_number]
        );

        res.status(201).json({
            message: 'Registration successful. Please wait for admin approval.',
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

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

        if (user.status === 'PENDING') {
            return res.status(403).json({ error: 'Account is pending approval' });
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
