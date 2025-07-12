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
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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
