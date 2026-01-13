const express = require('express');
const router = express.Router();
const db = require('../db');

// --- Helper: Insert History ---
async function insertHistory(client, configId, actionType, beforeVal, afterVal, reason, regId) {
    await client.query(
        `INSERT INTO COM_SYS_CONFIG_HIST 
         (CONFIG_ID, ACTION_TYPE, BEFORE_VALUE, AFTER_VALUE, CHG_REASON, REG_ID)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [configId, actionType, beforeVal, afterVal, reason, regId]
    );
}

// --- API Endpoints ---

// GET /api/config - List all configs
router.get('/', async (req, res) => {
    try {
        const { group, key, name } = req.query;
        let query = 'SELECT * FROM COM_SYS_CONFIG WHERE USE_YN = \'Y\'';
        let params = [];
        let paramCount = 0;

        if (group) {
            paramCount++;
            query += ` AND CONFIG_GROUP LIKE $${paramCount}`;
            params.push(`%${group}%`);
        }
        if (key) {
            paramCount++;
            query += ` AND CONFIG_KEY LIKE $${paramCount}`;
            params.push(`%${key}%`);
        }
        if (name) {
            paramCount++;
            query += ` AND CONFIG_NM_KO LIKE $${paramCount}`;
            params.push(`%${name}%`);
        }

        query += ' ORDER BY CONFIG_GROUP, SORT_ORDR, CONFIG_KEY';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/config - Create new config
router.post('/', async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const {
            CONFIG_ID, SYS_CODE, ENV_TYPE, CONFIG_GROUP, CONFIG_KEY, CONFIG_VALUE,
            VALUE_TYPE, CONFIG_NM_KO, CONFIG_NM_EN, REMARK_KO, REMARK_EN,
            USE_YN, SORT_ORDR, REG_ID
        } = req.body;

        // Duplicate check
        const check = await client.query(
            "SELECT 1 FROM COM_SYS_CONFIG WHERE SYS_CODE=$1 AND ENV_TYPE=$2 AND CONFIG_KEY=$3",
            [SYS_CODE, ENV_TYPE, CONFIG_KEY]
        );
        if (check.rows.length > 0) {
            throw new Error('Duplicate Configuration Key exist in this Environment.');
        }

        // Generate ID if not provided (User requested user inputs ID, but typically UUID or auto-gen. 
        // Schema says VARCHAR(50). Let's use user input or gen UUID. User request implies manual ID input? 
        // "CONFIG_ID VARCHAR(50) PRIMARY KEY". I'll assume input for now, or generate simple random.)
        // Actually, usually keys are meaningful. Let's use user input.

        await client.query(
            `INSERT INTO COM_SYS_CONFIG (
                CONFIG_ID, SYS_CODE, ENV_TYPE, CONFIG_GROUP, CONFIG_KEY, CONFIG_VALUE,
                VALUE_TYPE, CONFIG_NM_KO, CONFIG_NM_EN, REMARK_KO, REMARK_EN,
                USE_YN, SORT_ORDR, REG_ID, MOD_ID
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14)`,
            [
                CONFIG_ID, SYS_CODE, ENV_TYPE, CONFIG_GROUP, CONFIG_KEY, CONFIG_VALUE,
                VALUE_TYPE || 'STRING', CONFIG_NM_KO, CONFIG_NM_EN, REMARK_KO, REMARK_EN,
                USE_YN || 'Y', SORT_ORDR || 0, REG_ID
            ]
        );

        // History
        await insertHistory(client, CONFIG_ID, 'I', null, CONFIG_VALUE, 'New Registration', REG_ID);

        await client.query('COMMIT');
        res.status(201).json({ message: 'Configuration created' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});

// PUT /api/config/:id - Update config
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const {
            CONFIG_VALUE, CONFIG_NM_KO, REMARK_KO, USE_YN, MOD_ID, CHG_REASON
        } = req.body;

        // Get Before Value
        const oldData = await client.query("SELECT CONFIG_VALUE FROM COM_SYS_CONFIG WHERE CONFIG_ID = $1", [id]);
        if (oldData.rows.length === 0) {
            throw new Error('Configuration not found');
        }
        const beforeValue = oldData.rows[0].config_value;

        await client.query(
            `UPDATE COM_SYS_CONFIG
             SET CONFIG_VALUE = $1, CONFIG_NM_KO = $2, REMARK_KO = $3, USE_YN = $4, MOD_ID = $5, MOD_DT = CURRENT_TIMESTAMP
             WHERE CONFIG_ID = $6`,
            [CONFIG_VALUE, CONFIG_NM_KO, REMARK_KO, USE_YN, MOD_ID, id]
        );

        // History
        if (beforeValue !== CONFIG_VALUE) { // Only log history if value changed? Or structure changed? 
            // User requirement: History for action.
            await insertHistory(client, id, 'U', beforeValue, CONFIG_VALUE, CHG_REASON || 'Update', MOD_ID);
        } else {
            // Even if value didnt change, other fields might. 
            // History table schema tracks BEFORE_VALUE, AFTER_VALUE. 
            // Typically we track value changes. I'll log it mostly for Value changes or if forced.
            await insertHistory(client, id, 'U', beforeValue, CONFIG_VALUE, CHG_REASON || 'Info Update', MOD_ID);
        }

        await client.query('COMMIT');
        res.json({ message: 'Configuration updated' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// DELETE /api/config/:id - Delete config
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { MOD_ID, CHG_REASON } = req.body; // Need deleter ID. Passed in body for now.

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const oldData = await client.query("SELECT CONFIG_VALUE FROM COM_SYS_CONFIG WHERE CONFIG_ID = $1", [id]);
        if (oldData.rows.length === 0) {
            throw new Error('Config not found');
        }
        const beforeValue = oldData.rows[0].config_value;

        // Hard Delete as per request? Or Soft?
        // Let's implement Soft Delete via USE_YN='N' in Update usually.
        // But DELETE verb usually implies removal. 
        // For compliance/audit, often Soft Delete. 
        // User schema has USE_YN. I will Hard Delete but keep History? 
        // No, if I Hard Delete, I can't keep referential integrity if used elsewhere (though no FKs yet).
        // Best approach for "Management" systems: Soft DELETE or explicit DELETE. 
        // I will do Hard Delete here because History Table preserves the record of what happened.

        await insertHistory(client, id, 'D', beforeValue, null, CHG_REASON || 'Delete', MOD_ID || 'ADMIN');

        await client.query("DELETE FROM COM_SYS_CONFIG WHERE CONFIG_ID = $1", [id]);

        await client.query('COMMIT');
        res.json({ message: 'Configuration deleted' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

module.exports = router;
