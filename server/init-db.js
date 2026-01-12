const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initDb() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema.sql...');
        await db.query(schema);

        // Create initial admin user if not exists
        // Using a simple hash for '1234' just for demo. In production use bcrypt.
        // For this example I will insert directly.
        // Password '1234' -> In real app, hash this!

        // Check if admin exists
        const checkAdmin = await db.query("SELECT * FROM users WHERE login_id = 'admin'");
        if (checkAdmin.rows.length === 0) {
            console.log('Creating default admin user...');
            await db.query(`
            INSERT INTO users (login_id, password_hash, email, user_name, user_role)
            VALUES ($1, $2, $3, $4, $5)
        `, ['admin', '1234', 'admin@example.com', 'Administrator', 'ADMIN']);
        }

        console.log('Database initialized successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDb();
