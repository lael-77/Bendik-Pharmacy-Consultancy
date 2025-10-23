const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bendik_pharmacy_consultancy',
    port: process.env.DB_PORT || 3306
};

async function addSoftDeleteColumns() {
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
                console.log(`📝 Checking ${table} table...`);
                
                // Check if isDeleted column exists
                const [isDeletedColumns] = await connection.execute(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'isDeleted'`,
                    [dbConfig.database, table]
                );
                
                // Check if deletedAt column exists
                const [deletedAtColumns] = await connection.execute(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'deletedAt'`,
                    [dbConfig.database, table]
                );
                
                let columnsToAdd = [];
                
                if (isDeletedColumns.length === 0) {
                    columnsToAdd.push('isDeleted BOOLEAN DEFAULT FALSE');
                } else {
                    console.log(`✅ Column isDeleted already exists in ${table}`);
                }
                
                if (deletedAtColumns.length === 0) {
                    columnsToAdd.push('deletedAt TIMESTAMP NULL');
                } else {
                    console.log(`✅ Column deletedAt already exists in ${table}`);
                }
                
                if (columnsToAdd.length > 0) {
                    const alterQuery = `ALTER TABLE ${table} ADD COLUMN ${columnsToAdd.join(', ADD COLUMN ')}`;
                    await connection.execute(alterQuery);
                    console.log(`✅ Successfully added ${columnsToAdd.join(' and ')} to ${table}`);
                } else {
                    console.log(`✅ All soft delete columns already exist in ${table}`);
                }
                
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`✅ Columns already exist in ${table}`);
                } else {
                    console.error(`❌ Error updating ${table}:`, error.message);
                }
            }
        }
        
        console.log('🎉 Soft delete migration completed successfully!');
        console.log('📋 Summary:');
        console.log('   - isDeleted: BOOLEAN DEFAULT FALSE (marks records as deleted)');
        console.log('   - deletedAt: TIMESTAMP NULL (records when deletion occurred)');
        console.log('   - Records are hidden from dashboard but remain in database');
        console.log('   - Can be restored using the restore API endpoints');
        
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
addSoftDeleteColumns();
