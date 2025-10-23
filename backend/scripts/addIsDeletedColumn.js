const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bendik_pharmacy_consultancy',
    port: process.env.DB_PORT || 3306
};

async function addIsDeletedColumn() {
    let connection;
    
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        
        const tables = [
            'client_requests',
            'pharmacy_purchase_requests', 
            'pharmacy_sale_requests',
            'job_applications',
            'recruitment_requests'
        ];
        
        for (const table of tables) {
            try {
                console.log(`📝 Adding isDeleted and deletedAt columns to ${table}...`);
                
                // Check if column already exists
                const [columns] = await connection.execute(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'isDeleted'`,
                    [dbConfig.database, table]
                );
                
                if (columns.length > 0) {
                    console.log(`✅ Column isDeleted already exists in ${table}`);
                    continue;
                }
                
                // Add the isDeleted and deletedAt columns
                await connection.execute(
                    `ALTER TABLE ${table} ADD COLUMN isDeleted BOOLEAN DEFAULT FALSE, ADD COLUMN deletedAt TIMESTAMP NULL`
                );
                
                console.log(`✅ Successfully added isDeleted and deletedAt columns to ${table}`);
                
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`✅ Column isDeleted already exists in ${table}`);
                } else {
                    console.error(`❌ Error adding isDeleted column to ${table}:`, error.message);
                }
            }
        }
        
        console.log('🎉 Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the migration
addIsDeletedColumn();
