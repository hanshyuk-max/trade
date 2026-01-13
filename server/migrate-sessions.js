const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_uhmnRv9b1Tgf@ep-icy-moon-afx5smrj-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'
});

async function migrate() {
    try {
        console.log("Creating user_sessions table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                session_id      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id         BIGINT        NOT NULL,
                session_token   VARCHAR(255)  NOT NULL UNIQUE,
                device_info     TEXT,
                ip_address      VARCHAR(45),
                last_accessed_at TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
                created_at      TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);`);
        console.log("Done.");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

migrate();
