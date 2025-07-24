const express = require('express');
const router = express.Router();
const pharmacyPurchaseRequestController = require('../controllers/pharmacyPurchaseRequestController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new pharmacy purchase request
router.post('/', pharmacyPurchaseRequestController.create);

// Admin: Get all pharmacy purchase requests (protected)
router.get('/', authenticateJWT, pharmacyPurchaseRequestController.getAll);

module.exports = router; 