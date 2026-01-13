const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_uhmnRv9b1Tgf@ep-icy-moon-afx5smrj-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'
});

async function fixData() {
    try {
        console.log("--- Updating Messages ---");
        // Fix LOGIN_TITLE for KO
        await pool.query(`
            UPDATE COM_MSG_LANG 
            SET MSG_TEXT = '환영합니다 TradeOS' 
            WHERE MSG_ID = (SELECT MSG_ID FROM COM_MSG_MST WHERE MSG_KEY = 'LOGIN_TITLE') 
            AND LANG_CODE = 'ko'
        `);
        console.log("Updated LOGIN_TITLE");

        console.log("--- Updating Users ---");
        // Ensure admin has ADMIN role
        await pool.query("UPDATE users SET user_role = 'ADMIN', status = 'ACTIVE' WHERE login_id = 'admin'");
        console.log("Updated admin role to ADMIN");

        // Create or update a standard user
        const userCheck = await pool.query("SELECT * FROM users WHERE login_id = 'user'");
        if (userCheck.rows.length === 0) {
            await pool.query(`
                INSERT INTO users (login_id, password_hash, email, user_name, user_role, status)
                VALUES ('user', '1234', 'user@example.com', 'Standard User', 'USER', 'ACTIVE')
            `);
            console.log("Created standard user 'user'");
        } else {
            await pool.query("UPDATE users SET user_role = 'USER', status = 'ACTIVE' WHERE login_id = 'user'");
            console.log("Updated 'user' role to USER");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

fixData();
