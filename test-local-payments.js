// Test script to verify payment functions directly
// Run with: node test-local-payments.js

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

// Set environment variables for testing
process.env.ITEC_MTN_API_KEY = 'test_mtn_key';
process.env.ITEC_AIRTEL_API_KEY = 'test_airtel_key';
process.env.ITEC_CARD_API_KEY = 'test_card_key';
process.env.ITEC_MTN_BASE_URL = 'https://api.itecpay.com';
process.env.ITEC_AIRTEL_BASE_URL = 'https://api.itecpay.com';
process.env.ITEC_CARD_BASE_URL = 'https://api.itecpay.com';
process.env.ITEC_PAY_CALLBACK_URL = 'https://bendikpharmacyconsult.com/payment-callback';
process.env.DEFAULT_PAYER_MSISDN = '250796690160';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['*'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Mock database for testing
const mockDb = {
  payments: [],
  clientRequests: [],
  jobApplications: [],
  recruitmentRequests: [],
  pharmacyPurchaseRequests: [],
  pharmacySaleRequests: []
};

// Attach mock db to req for controllers
app.use((req, res, next) => {
    req.db = mockDb;
    next();
});

// Import payment routes
const paymentRoutes = require('./backend/routes/payments');

// Routes
app.use('/api/pay', paymentRoutes);

// Test endpoints for form submissions
app.post('/api/client-requests', (req, res) => {
  console.log('✅ Client request received:', req.body);
  mockDb.clientRequests.push({
    id: mockDb.clientRequests.length + 1,
    ...req.body,
    createdAt: new Date()
  });
  res.json({ success: true, message: 'Client request submitted successfully' });
});

app.post('/api/job-applications', (req, res) => {
  console.log('✅ Job application received:', req.body);
  mockDb.jobApplications.push({
    id: mockDb.jobApplications.length + 1,
    ...req.body,
    createdAt: new Date()
  });
  res.json({ success: true, message: 'Job application submitted successfully' });
});

app.post('/api/recruitment-requests', (req, res) => {
  console.log('✅ Recruitment request received:', req.body);
  mockDb.recruitmentRequests.push({
    id: mockDb.recruitmentRequests.length + 1,
    ...req.body,
    createdAt: new Date()
  });
  res.json({ success: true, message: 'Recruitment request submitted successfully' });
});

app.post('/api/pharmacy-purchase-requests', (req, res) => {
  console.log('✅ Pharmacy purchase request received:', req.body);
  mockDb.pharmacyPurchaseRequests.push({
    id: mockDb.pharmacyPurchaseRequests.length + 1,
    ...req.body,
    createdAt: new Date()
  });
  res.json({ success: true, message: 'Pharmacy purchase request submitted successfully' });
});

app.post('/api/pharmacy-sale-requests', (req, res) => {
  console.log('✅ Pharmacy sale request received:', req.body);
  mockDb.pharmacySaleRequests.push({
    id: mockDb.pharmacySaleRequests.length + 1,
    ...req.body,
    createdAt: new Date()
  });
  res.json({ success: true, message: 'Pharmacy sale request submitted successfully' });
});

// Health check endpoint
app.get('/', (req, res) => {
    res.send('🧪 Test Payment Backend Running - No Database Required');
});

// Start server
app.listen(PORT, () => {
    console.log(`🧪 Test server running on port ${PORT}`);
    console.log('📝 Environment variables loaded:');
    console.log('- ITEC_MTN_API_KEY:', process.env.ITEC_MTN_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('- ITEC_AIRTEL_API_KEY:', process.env.ITEC_AIRTEL_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('- ITEC_CARD_API_KEY:', process.env.ITEC_CARD_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('🚀 Ready for testing!');
    console.log('🌐 Server URL: http://localhost:3001');
    console.log('📋 Test the endpoints:');
    console.log('   - GET  http://localhost:3001/');
    console.log('   - POST http://localhost:3001/api/pay/mtn');
    console.log('   - POST http://localhost:3001/api/pay/airtel');
    console.log('   - POST http://localhost:3001/api/pay/card');
});
