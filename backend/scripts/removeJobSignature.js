// Database migration script to remove signature column from job_applications table
// Run this script if you have existing data in the job_applications table

const mysql = require('mysql2/promise');
require('dotenv').config();

async function removeJobSignatureColumn() {
    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('✅ Connected to database');

        // Check if the column exists
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'job_applications' 
            AND COLUMN_NAME = 'signature'
        `, [process.env.DB_NAME]);

        if (columns.length > 0) {
            console.log('❌ signature column found in job_applications - removing it...');
            
            // Remove the column
            await connection.execute(`
                ALTER TABLE job_applications 
                DROP COLUMN signature
            `);
            
            console.log('✅ signature column removed successfully from job_applications');
        } else {
            console.log('✅ signature column does not exist in job_applications - no action needed');
        }

    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Run the migration
removeJobSignatureColumn(); 