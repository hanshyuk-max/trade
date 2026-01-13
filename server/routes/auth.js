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

        // --- Concurrent Session Check ---
        const activeSessions = await db.query("SELECT * FROM user_sessions WHERE user_id = $1", [user.user_id]);

        // Helper to create session
        const createSession = async (userId, deviceInfo, ip) => {
            const token = Math.random().toString(36).substring(2) + Date.now().toString(36); // Simple token
            await db.query(
                "INSERT INTO user_sessions (user_id, session_token, device_info, ip_address) VALUES ($1, $2, $3, $4)",
                [userId, token, deviceInfo, ip]
            );
            return token;
        };

        const currentDeviceInfo = req.headers['user-agent'] || 'Unknown Device';
        const clientIp = req.ip;

        if (activeSessions.rows.length > 0) {
            // Found existing session(s)
            return res.json({
                status: 'CONCURRENT_LOGIN',
                message: 'Active session detected.',
                sessions: activeSessions.rows.map(s => ({
                    device: s.device_info,
                    last_accessed: s.last_accessed_at,
                    ip: s.ip_address
                }))
            });
        }

        // No active session, proceed to create one
        const token = await createSession(user.user_id, currentDeviceInfo, clientIp);

        // Update last login
        await db.query("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1", [user.user_id]);

        // Remove sensitive info
        delete user.password_hash;

        res.json({
            status: 'SUCCESS',
            user: {
                id: user.user_id,
                username: user.login_id,
                name: user.user_name,
                role: user.user_role
            },
            token: token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login/confirm', async (req, res) => {
    const { username, password, action } = req.body; // action: 'ALLOW', 'DENY_ALL'

    try {
        const result = await db.query("SELECT * FROM users WHERE login_id = $1", [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = result.rows[0];
        if (user.password_hash !== password) return res.status(401).json({ error: 'Invalid credentials' });

        const currentDeviceInfo = req.headers['user-agent'] || 'Unknown Device';
        const clientIp = req.ip;

        if (action === 'DENY_ALL') {
            // Kick other devices
            await db.query("DELETE FROM user_sessions WHERE user_id = $1", [user.user_id]);
        }

        // 'ALLOW' just falls through to create new session (existing ones remain)

        // Create new session
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        await db.query(
            "INSERT INTO user_sessions (user_id, session_token, device_info, ip_address) VALUES ($1, $2, $3, $4)",
            [user.user_id, token, currentDeviceInfo, clientIp]
        );

        // Update last login
        await db.query("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1", [user.user_id]);

        delete user.password_hash;

        res.json({
            status: 'SUCCESS',
            user: {
                id: user.user_id,
                username: user.login_id,
                name: user.user_name,
                role: user.user_role
            },
            token: token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/logout', async (req, res) => {
    const { token } = req.body;
    try {
        if (token) {
            await db.query("DELETE FROM user_sessions WHERE session_token = $1", [token]);
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Logout failed' });
    }
});

module.exports = router;
