const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
    const dbName = 'trade_db';
    // Connect to default 'postgres' database to create the new one
    const client = new Client({
        connectionString: process.env.DATABASE_URL.replace(`/${dbName}`, '/postgres'),
    });

    try {
        await client.connect();

        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

        if (res.rowCount === 0) {
            console.log(`Database ${dbName} does not exist. Creating...`);
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database ${dbName} created successfully.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
