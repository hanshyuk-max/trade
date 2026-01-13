const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs');
const path = require('path');

// Helper
const getClientLocalesPath = () => {
    // Assuming backend is in server/ and client is in client/
    // d:\GitTrade\test\server -> d:\GitTrade\test\client\public\locales
    return path.join(__dirname, '../../client/public/locales');
};

// GET /api/messages - List
router.get('/', async (req, res) => {
    try {
        const { category, key, text } = req.query;
        let query = `
            SELECT m.*, 
                   max(case when l.lang_code = 'ko' then l.msg_text end) as text_ko,
                   max(case when l.lang_code = 'en' then l.msg_text end) as text_en
            FROM COM_MSG_MST m
            LEFT JOIN COM_MSG_LANG l ON m.MSG_ID = l.MSG_ID
            WHERE m.USE_YN = 'Y'
        `;
        let params = [];
        let count = 0;

        if (category) { count++; query += ` AND m.CATEGORY = $${count}`; params.push(category); }
        if (key) { count++; query += ` AND m.MSG_KEY LIKE $${count}`; params.push(`%${key}%`); }

        // Text search is trickier with aggregation, but let's keep it simple for now or filter on client
        query += ` GROUP BY m.MSG_ID ORDER BY m.CATEGORY, m.MSG_KEY`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/messages - Create
router.post('/', async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const { MSG_ID, MSG_KEY, MSG_TYPE, CATEGORY, TEXT_KO, TEXT_EN, REG_ID } = req.body; // MSG_ID user provided or auto? Let's treat as separate

        // Generate ID if empty
        const newId = MSG_ID || `MSG_${Date.now()}`;

        await client.query(
            `INSERT INTO COM_MSG_MST (MSG_ID, MSG_KEY, MSG_TYPE, CATEGORY, REG_ID)
             VALUES ($1, $2, $3, $4, $5)`,
            [newId, MSG_KEY, MSG_TYPE || 'LBL', CATEGORY, REG_ID || 'ADMIN']
        );

        // Langs
        if (TEXT_KO) {
            await client.query("INSERT INTO COM_MSG_LANG (MSG_ID, LANG_CODE, MSG_TEXT) VALUES ($1, 'ko', $2)", [newId, TEXT_KO]);
        }
        if (TEXT_EN) {
            await client.query("INSERT INTO COM_MSG_LANG (MSG_ID, LANG_CODE, MSG_TEXT) VALUES ($1, 'en', $2)", [newId, TEXT_EN]);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Message created' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// PUT /api/messages/:id - Update
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const { TEXT_KO, TEXT_EN, MOD_ID, USE_YN } = req.body;

        await client.query(
            "UPDATE COM_MSG_MST SET USE_YN = COALESCE($1, USE_YN), MOD_ID = $2, SYNC_STAT = 'CHANGED' WHERE MSG_ID = $3",
            [USE_YN, MOD_ID || 'ADMIN', id]
        );

        // Update/Insert Langs (Upsert)
        if (TEXT_KO !== undefined) {
            await client.query(
                `INSERT INTO COM_MSG_LANG (MSG_ID, LANG_CODE, MSG_TEXT) VALUES ($1, 'ko', $2)
                 ON CONFLICT (MSG_ID, LANG_CODE) DO UPDATE SET MSG_TEXT = EXCLUDED.MSG_TEXT`,
                [id, TEXT_KO]
            );
        }
        if (TEXT_EN !== undefined) {
            await client.query(
                `INSERT INTO COM_MSG_LANG (MSG_ID, LANG_CODE, MSG_TEXT) VALUES ($1, 'en', $2)
                 ON CONFLICT (MSG_ID, LANG_CODE) DO UPDATE SET MSG_TEXT = EXCLUDED.MSG_TEXT`,
                [id, TEXT_EN]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Message updated' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// POST /api/messages/export - Deploy to JSON
router.post('/export', async (req, res) => {
    try {
        // Fetch all active messages
        const result = await db.query(`
            SELECT m.MSG_KEY, l.LANG_CODE, l.MSG_TEXT
            FROM COM_MSG_MST m
            JOIN COM_MSG_LANG l ON m.MSG_ID = l.MSG_ID
            WHERE m.USE_YN = 'Y'
        `);

        // Group by Lang
        const enObj = {};
        const koObj = {};

        result.rows.forEach(row => {
            if (row.lang_code === 'en') enObj[row.msg_key] = row.msg_text;
            if (row.lang_code === 'ko') koObj[row.msg_key] = row.msg_text;
        });

        const localePath = getClientLocalesPath();

        // Ensure dirs
        if (!fs.existsSync(path.join(localePath, 'en'))) fs.mkdirSync(path.join(localePath, 'en'), { recursive: true });
        if (!fs.existsSync(path.join(localePath, 'ko'))) fs.mkdirSync(path.join(localePath, 'ko'), { recursive: true });

        // Write Files
        fs.writeFileSync(path.join(localePath, 'en/translation.json'), JSON.stringify(enObj, null, 2));
        fs.writeFileSync(path.join(localePath, 'ko/translation.json'), JSON.stringify(koObj, null, 2));

        // Mark as SYNCED?
        await db.query("UPDATE COM_MSG_MST SET SYNC_STAT = 'SYNCED' WHERE USE_YN='Y'");

        res.json({ message: 'Export successful', path: localePath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
