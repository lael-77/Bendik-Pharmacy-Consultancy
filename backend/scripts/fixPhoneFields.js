const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixPhoneFields() {
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
        console.log('🔧 Fixing phone field names in all tables...');
        
        // Fix recruitment_requests table
        console.log('📱 Fixing recruitment_requests table...');
        const [recruitmentColumns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.columns 
            WHERE table_schema = ? AND table_name = 'recruitment_requests' AND column_name = 'phone'
        `, [process.env.DB_NAME || 'bobo']);
        
        if (recruitmentColumns.length > 0) {
            await db.query(`
                ALTER TABLE recruitment_requests 
                CHANGE COLUMN phone phoneNumber VARCHAR(50) NOT NULL
            `);
            console.log('✅ Fixed recruitment_requests.phone → phoneNumber');
        } else {
            console.log('ℹ️ recruitment_requests.phone already fixed or table does not exist');
        }
        
        // Fix job_applications table
        console.log('📱 Fixing job_applications table...');
        const [jobColumns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.columns 
            WHERE table_schema = ? AND table_name = 'job_applications' AND column_name = 'phone'
        `, [process.env.DB_NAME || 'bobo']);
        
        if (jobColumns.length > 0) {
            await db.query(`
                ALTER TABLE job_applications 
                CHANGE COLUMN phone phoneNumber VARCHAR(50) NOT NULL
            `);
            console.log('✅ Fixed job_applications.phone → phoneNumber');
        } else {
            console.log('ℹ️ job_applications.phone already fixed or table does not exist');
        }
        
        console.log('🎉 All phone field migrations completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await db.end();
    }
}

fixPhoneFields();
