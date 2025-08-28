// Database migration script to add signature column to client_requests table
// Run this script if you have existing data in the client_requests table

const mysql = require('mysql2/promise');
require('dotenv').config();

async function addClientSignatureColumn() {
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
            AND TABLE_NAME = 'client_requests' 
            AND COLUMN_NAME = 'signature'
        `, [process.env.DB_NAME]);

        if (columns.length === 0) {
            console.log('❌ signature column not found in client_requests - adding it...');
            
            // Add the column
            await connection.execute(`
                ALTER TABLE client_requests 
                ADD COLUMN signature VARCHAR(255) AFTER declaration
            `);
            
            console.log('✅ signature column added successfully to client_requests');
        } else {
            console.log('✅ signature column already exists in client_requests - no action needed');
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
addClientSignatureColumn();
