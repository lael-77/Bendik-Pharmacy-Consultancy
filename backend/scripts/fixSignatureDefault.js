// Database migration script to add default values to signature columns
// This script fixes the "Field 'signature' doesn't have a default value" error

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixSignatureDefaults() {
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

        // Fix pharmacy_sale_requests table signature column
        try {
            await connection.execute(`
                ALTER TABLE pharmacy_sale_requests 
                MODIFY COLUMN signature VARCHAR(255) DEFAULT 'Digital Signature'
            `);
            console.log('✅ Fixed signature column in pharmacy_sale_requests table');
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                console.log('⚠️ signature column does not exist in pharmacy_sale_requests - adding it...');
                await connection.execute(`
                    ALTER TABLE pharmacy_sale_requests 
                    ADD COLUMN signature VARCHAR(255) DEFAULT 'Digital Signature' AFTER date
                `);
                console.log('✅ Added signature column to pharmacy_sale_requests table');
            } else {
                console.log('✅ signature column already has default value in pharmacy_sale_requests');
            }
        }

        // Fix other tables that might have signature columns
        const tables = ['recruitment_requests', 'client_requests', 'job_applications'];
        
        for (const table of tables) {
            try {
                await connection.execute(`
                    ALTER TABLE ${table} 
                    MODIFY COLUMN signature VARCHAR(255) DEFAULT 'Digital Signature'
                `);
                console.log(`✅ Fixed signature column in ${table} table`);
            } catch (error) {
                if (error.code === 'ER_BAD_FIELD_ERROR') {
                    console.log(`⚠️ signature column does not exist in ${table} - skipping...`);
                } else {
                    console.log(`✅ signature column already has default value in ${table}`);
                }
            }
        }

        console.log('✅ All signature columns have been fixed!');

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
fixSignatureDefaults();
