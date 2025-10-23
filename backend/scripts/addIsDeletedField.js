const mysql = require('mysql2/promise');

async function addIsDeletedField() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bendik_pharmacy_consultancy'
    });

    try {
        console.log('🔧 Adding isDeleted and deletedAt fields to all tables...');

        const tables = [
            'client_requests',
            'pharmacy_purchase_requests', 
            'pharmacy_sale_requests',
            'job_applications',
            'recruitment_requests'
        ];

        for (const table of tables) {
            try {
                // Check if column already exists
                const [columns] = await connection.execute(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'isDeleted'`,
                    [process.env.DB_NAME || 'bendik_pharmacy_consultancy', table]
                );

                if (columns.length === 0) {
                    await connection.execute(
                        `ALTER TABLE ${table} ADD COLUMN isDeleted BOOLEAN DEFAULT FALSE, ADD COLUMN deletedAt TIMESTAMP NULL`
                    );
                    console.log(`✅ Added isDeleted and deletedAt fields to ${table}`);
                } else {
                    console.log(`⚠️ isDeleted field already exists in ${table}`);
                }
            } catch (error) {
                console.error(`❌ Error adding isDeleted field to ${table}:`, error.message);
            }
        }

        console.log('🎉 Successfully added isDeleted and deletedAt fields to all tables!');
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    } finally {
        await connection.end();
    }
}

// Run the script
addIsDeletedField();

