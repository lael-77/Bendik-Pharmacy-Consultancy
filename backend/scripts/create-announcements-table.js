const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAnnouncementsTable() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('✅ Connected to MySQL database');
        console.log(`📊 Using database: ${process.env.DB_NAME}\n`);

        // Create announcements table
        console.log('Creating announcements table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✅ announcements table created\n');

        // Show table structure
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'announcements'
            ORDER BY ORDINAL_POSITION
        `, [process.env.DB_NAME]);

        console.log('📋 Announcements Table Structure:');
        console.log('─'.repeat(60));
        columns.forEach(col => {
            const nullable = col.IS_NULLABLE === 'YES' ? 'YES' : 'NO';
            const defaultValue = col.COLUMN_DEFAULT ? ` (default: ${col.COLUMN_DEFAULT})` : '';
            console.log(`  ${col.COLUMN_NAME.padEnd(20)} ${col.DATA_TYPE.padEnd(15)} ${nullable.padEnd(8)}${defaultValue}`);
        });
        console.log('─'.repeat(60));
        console.log(`\n✅ Announcements table ready!\n`);

    } catch (error) {
        console.error('❌ Error creating table:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createAnnouncementsTable();

