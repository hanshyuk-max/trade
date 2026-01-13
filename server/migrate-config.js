const fs = require('fs');
const path = require('path');
const db = require('./db');

async function migrate() {
    try {
        console.log('Running migration for System Config tables...');

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const createConfigTable = `
            CREATE TABLE IF NOT EXISTS COM_SYS_CONFIG (
                CONFIG_ID           VARCHAR(50)   PRIMARY KEY,
                SYS_CODE            VARCHAR(20)   NOT NULL,
                ENV_TYPE            VARCHAR(10)   NOT NULL,
                CONFIG_GROUP        VARCHAR(50)   NOT NULL,
                CONFIG_KEY          VARCHAR(100)  NOT NULL,
                CONFIG_VALUE        TEXT          NOT NULL,
                VALUE_TYPE          VARCHAR(10)   DEFAULT 'STRING',
                CONFIG_NM_KO        VARCHAR(200)  NOT NULL,
                CONFIG_NM_EN        VARCHAR(200),
                REMARK_KO           VARCHAR(1000),
                REMARK_EN           VARCHAR(1000),
                ENC_YN              CHAR(1)       DEFAULT 'N',
                ENC_KEY_ID          VARCHAR(50),
                MASK_YN             CHAR(1)       DEFAULT 'N',
                DATA_LEVEL          VARCHAR(10)   DEFAULT 'L2',
                APPR_STAT           VARCHAR(10)   DEFAULT 'APPR',
                USE_YN              CHAR(1)       DEFAULT 'Y',
                SORT_ORDR           INTEGER       DEFAULT 0,
                REG_ID              VARCHAR(20)   NOT NULL,
                REG_DT              TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
                MOD_ID              VARCHAR(20),
                MOD_DT              TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP
            );
            `;
            await client.query(createConfigTable);

            // Index
            await client.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'uix_com_sys_config_01') THEN
                        CREATE UNIQUE INDEX UIX_COM_SYS_CONFIG_01 ON COM_SYS_CONFIG (SYS_CODE, ENV_TYPE, CONFIG_KEY);
                    END IF;
                END
                $$;
            `);

            const createHistTable = `
            CREATE TABLE IF NOT EXISTS COM_SYS_CONFIG_HIST (
                HIST_SEQ            SERIAL        PRIMARY KEY,
                CONFIG_ID           VARCHAR(50)   NOT NULL,
                ACTION_TYPE         CHAR(1)       NOT NULL,
                BEFORE_VALUE        TEXT,
                AFTER_VALUE         TEXT,
                CHG_REASON          VARCHAR(500),
                REG_ID              VARCHAR(20)   NOT NULL,
                REG_DT              TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP
            );
            `;
            await client.query(createHistTable);

            // Trigger (Check if exists first or just create or replace function and drop trigger if exists)
            await client.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_config_modtime') THEN
                        CREATE TRIGGER update_config_modtime
                        BEFORE UPDATE ON COM_SYS_CONFIG
                        FOR EACH ROW
                        EXECUTE PROCEDURE update_timestamp_column();
                    END IF;
                END
                $$;
            `);

            await client.query('COMMIT');
            console.log('Migration completed successfully.');
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

migrate();
