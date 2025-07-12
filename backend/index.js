const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// MySQL connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bobo',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }, // Required for Aiven SSL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    console.log('Database config:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    // Check if admins table exists
    return connection.query('SHOW TABLES LIKE "admins"');
  })
  .then(([rows]) => {
    if (rows.length > 0) {
      console.log('✅ admins table exists');
    } else {
      console.log('❌ admins table does not exist - creating it...');
      return db.query(`
        CREATE TABLE admins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
  })
  .then(() => {
    console.log('✅ Database setup complete');
  })
  .catch(err => {
    console.error('❌ Database connection/setup failed:', err.message);
    console.error('Database config:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
  });

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bendikpharmacyconsult.com',
    'https://bendik-pharmacy-consultancy.onrender.com'
  ],
  credentials: true
}));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Attach db to req for controllers
app.use((req, res, next) => {
    req.db = db;
    next();
});

const adminRoutes = require('./routes/admin');
const buyInquiryRoutes = require('./routes/buyInquiries');
const sellListingRoutes = require('./routes/sellListings');

app.use('/api/admin', adminRoutes);
app.use('/api/buy-inquiries', buyInquiryRoutes);
app.use('/api/sell-listings', sellListingRoutes);

app.get('/', (req, res) => {
    res.send('Pharmacy backend running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
