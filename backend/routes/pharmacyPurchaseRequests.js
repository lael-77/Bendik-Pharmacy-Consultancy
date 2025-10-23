const express = require('express');
const router = express.Router();
const pharmacyPurchaseRequestController = require('../controllers/pharmacyPurchaseRequestController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new pharmacy purchase request
router.post('/', pharmacyPurchaseRequestController.create);

// Admin: Get all pharmacy purchase requests (protected)
router.get('/', authenticateJWT, pharmacyPurchaseRequestController.getAll);

// Admin: Soft delete a pharmacy purchase request (protected)
router.delete('/:id', authenticateJWT, pharmacyPurchaseRequestController.softDelete);

// Admin: Restore a soft deleted pharmacy purchase request (protected)
router.patch('/:id/restore', authenticateJWT, pharmacyPurchaseRequestController.restore);

module.exports = router; 