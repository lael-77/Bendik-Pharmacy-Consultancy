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
    
    // Check if admins table exists using a different approach
    return connection.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'admins'", [process.env.DB_NAME]);
  })
  .then(([rows]) => {
    if (rows[0].count > 0) {
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
    // Check if client_requests table exists
    return db.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'client_requests'", [process.env.DB_NAME]);
  })
  .then(([rows]) => {
    if (rows[0].count > 0) {
      console.log('✅ client_requests table exists');
    } else {
      console.log('❌ client_requests table does not exist - creating it...');
      return db.query(`
        CREATE TABLE client_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          fullName VARCHAR(255) NOT NULL,
          organizationName VARCHAR(255) NOT NULL,
          businessType VARCHAR(100) NOT NULL,
          nationalId VARCHAR(100) NOT NULL,
          tinNumber VARCHAR(100) NOT NULL,
          location VARCHAR(255) NOT NULL,
          phoneNumber VARCHAR(50) NOT NULL,
          email VARCHAR(255) NOT NULL,
          contactMode VARCHAR(50) NOT NULL,
          services TEXT,
          otherService VARCHAR(255),
          urgency VARCHAR(50) NOT NULL,
          specificDates VARCHAR(255),
          description TEXT NOT NULL,
          PreferedInsurance TEXT NOT NULL,
          requireQuotation VARCHAR(10) NOT NULL,
          paymentMode VARCHAR(50) NOT NULL,
          invoicingName VARCHAR(255),
          declaration VARCHAR(10) NOT NULL,
          signature VARCHAR(255) NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
  })
  .then(() => {
    // Check if pharmacy_purchase_requests table exists
    return db.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'pharmacy_purchase_requests'", [process.env.DB_NAME]);
  })
  .then(([rows]) => {
    if (rows[0].count > 0) {
      console.log('✅ pharmacy_purchase_requests table exists');
    } else {
      console.log('❌ pharmacy_purchase_requests table does not exist - creating it...');
      return db.query(`
        CREATE TABLE pharmacy_purchase_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          buyerName VARCHAR(255) NOT NULL,
          phoneNumber VARCHAR(50) NOT NULL,
          email VARCHAR(255) NOT NULL,
          contactMethod VARCHAR(50) NOT NULL,
          nationalId VARCHAR(100),
          tinNumber VARCHAR(100),
          pharmacyType TEXT,
          otherType VARCHAR(255),
          preferredLocation VARCHAR(255),
          operatingArea VARCHAR(50),
          businessStatus VARCHAR(50),
          ownershipType VARCHAR(50),
          minRevenue VARCHAR(100),
          budgetRange VARCHAR(100),
          budgetFlexible VARCHAR(20),
          timeline VARCHAR(50),
          insurancePartners VARCHAR(255),
          supportServices TEXT,
          otherServices VARCHAR(255),
          additionalInfo TEXT,
          clientSignature VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
  })
  .then(() => {
    // Check if pharmacy_sale_requests table exists
    return db.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'pharmacy_sale_requests'", [process.env.DB_NAME]);
  })
  .then(([rows]) => {
    if (rows[0].count > 0) {
      console.log('✅ pharmacy_sale_requests table exists');
    } else {
      console.log('❌ pharmacy_sale_requests table does not exist - creating it...');
      return db.query(`
        CREATE TABLE pharmacy_sale_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ownerName VARCHAR(255) NOT NULL,
          phoneNumber VARCHAR(50) NOT NULL,
          email VARCHAR(255) NOT NULL,
          contactMode VARCHAR(50),
          pharmacyName VARCHAR(255),
          businessType VARCHAR(50),
          location VARCHAR(255),
          ownershipType VARCHAR(50),
          premisesSize VARCHAR(50),
          licenseStatus VARCHAR(50),
          years VARCHAR(50),
          salesRange VARCHAR(100),
          insurancePartners VARCHAR(255),
          staffCount VARCHAR(50),
          inventoryValue VARCHAR(100),
          equipmentIncluded VARCHAR(50),
          reason VARCHAR(255),
          debts VARCHAR(10),
          debtAmount VARCHAR(100),
          price VARCHAR(100),
          negotiable VARCHAR(10),
          timeline VARCHAR(50),
          valuationService VARCHAR(10),
          additionalInfo TEXT,
          documents TEXT,
          signature VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    'https://www.bendikpharmacyconsult.com',
    'https://kit.fontawesome.com/a076d05399.js',
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
const clientRequestRoutes = require('./routes/clientRequests');
const pharmacyPurchaseRequestRoutes = require('./routes/pharmacyPurchaseRequests');
const pharmacySaleRequestRoutes = require('./routes/pharmacySaleRequests');

app.use('/api/admin', adminRoutes);
app.use('/api/client-requests', clientRequestRoutes);
app.use('/api/pharmacy-purchase-requests', pharmacyPurchaseRequestRoutes);
app.use('/api/pharmacy-sale-requests', pharmacySaleRequestRoutes);

app.get('/', (req, res) => {
    res.send('Pharmacy backend running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
