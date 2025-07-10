const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'bobo';

async function createAdmin(email, password) {
    const db = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
    });

    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashed]);
    console.log('Admin created:', email);
    await db.end();
}

// Usage: node scripts/createAdmin.js admin@pharmacare.com yourpassword
const [,, email, password] = process.argv;
if (!email || !password) {
    console.log('Usage: node scripts/createAdmin.js <email> <password>');
    process.exit(1);
}
createAdmin(email, password);