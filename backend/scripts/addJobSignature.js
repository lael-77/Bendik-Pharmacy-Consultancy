// Database migration script to add signature column to job_applications table
// Run this script if you have existing data in the job_applications table

const mysql = require('mysql2/promise');
require('dotenv').config();

async function addJobSignatureColumn() {
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

        if (columns.length === 0) {
            console.log('❌ signature column not found in job_applications - adding it...');
            
            // Add the column
            await connection.execute(`
                ALTER TABLE job_applications 
                ADD COLUMN signature VARCHAR(255) AFTER refPhone1
            `);
            
            console.log('✅ signature column added successfully to job_applications');
        } else {
            console.log('✅ signature column already exists in job_applications - no action needed');
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
addJobSignatureColumn();
