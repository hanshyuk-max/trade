const db = require('./db');

async function fixTrigger() {
    try {
        console.log('Fixing triggers...');
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Drop old trigger
            await client.query('DROP TRIGGER IF EXISTS update_config_modtime ON COM_SYS_CONFIG');

            // Create new function
            await client.query(`
                CREATE OR REPLACE FUNCTION update_config_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.MOD_DT = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql';
            `);

            // Re-create trigger
            await client.query(`
                CREATE TRIGGER update_config_modtime
                BEFORE UPDATE ON COM_SYS_CONFIG
                FOR EACH ROW
                EXECUTE PROCEDURE update_config_timestamp();
            `);

            await client.query('COMMIT');
            console.log('Trigger fixed successfully.');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

fixTrigger();
