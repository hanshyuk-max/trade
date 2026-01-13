const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/postgres'
});

async function checkData() {
    try {
        console.log("--- Users ---");
        const resUsers = await pool.query("SELECT user_id, login_id, user_role FROM users");
        console.table(resUsers.rows);

        console.log("--- Messages (LOGIN_TITLE) ---");
        const resMsg = await pool.query(`
            SELECT m.msg_key, l.lang_code, l.msg_text 
            FROM com_msg_mst m 
            JOIN com_msg_lang l ON m.msg_id = l.msg_id 
            WHERE m.msg_key = 'LOGIN_TITLE'
        `);
        console.table(resMsg.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkData();
