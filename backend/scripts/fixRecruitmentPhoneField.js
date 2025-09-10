const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixRecruitmentPhoneField() {
    const db = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bobo',
        port: process.env.DB_PORT || 3306,
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('🔧 Fixing recruitment_requests phone field...');
        
        // Check if phone column exists
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.columns 
            WHERE table_schema = ? AND table_name = 'recruitment_requests' AND column_name = 'phone'
        `, [process.env.DB_NAME || 'bobo']);
        
        if (columns.length > 0) {
            console.log('📱 Found "phone" column, renaming to "phoneNumber"...');
            
            // Rename the column
            await db.query(`
                ALTER TABLE recruitment_requests 
                CHANGE COLUMN phone phoneNumber VARCHAR(50) NOT NULL
            `);
            
            console.log('✅ Successfully renamed "phone" to "phoneNumber"');
        } else {
            console.log('ℹ️ "phone" column not found, checking for "phoneNumber"...');
            
            // Check if phoneNumber column exists
            const [phoneNumberColumns] = await db.query(`
                SELECT COLUMN_NAME 
                FROM information_schema.columns 
                WHERE table_schema = ? AND table_name = 'recruitment_requests' AND column_name = 'phoneNumber'
            `, [process.env.DB_NAME || 'bobo']);
            
            if (phoneNumberColumns.length > 0) {
                console.log('✅ "phoneNumber" column already exists');
            } else {
                console.log('❌ Neither "phone" nor "phoneNumber" column found');
            }
        }
        
        console.log('🎉 Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await db.end();
    }
}

fixRecruitmentPhoneField();
