// Database migration script to remove signature column from pharmacy_sale_requests table
// Run this script if you have existing data in the pharmacy_sale_requests table

const mysql = require('mysql2/promise');
require('dotenv').config();

async function removeSaleSignatureColumn() {
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
            AND TABLE_NAME = 'pharmacy_sale_requests' 
            AND COLUMN_NAME = 'signature'
        `, [process.env.DB_NAME]);

        if (columns.length > 0) {
            console.log('❌ signature column found in pharmacy_sale_requests - removing it...');
            
            // Remove the column
            await connection.execute(`
                ALTER TABLE pharmacy_sale_requests 
                DROP COLUMN signature
            `);
            
            console.log('✅ signature column removed successfully from pharmacy_sale_requests');
        } else {
            console.log('✅ signature column does not exist in pharmacy_sale_requests - no action needed');
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
removeSaleSignatureColumn(); 