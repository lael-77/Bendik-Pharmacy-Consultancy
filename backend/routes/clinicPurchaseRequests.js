const express = require('express');
const router = express.Router();
const clinicPurchaseRequestController = require('../controllers/clinicPurchaseRequestController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new pharmacy purchase request
router.post('/', clinicPurchaseRequestController.create);

// Admin: Get all pharmacy purchase requests (protected)
router.get('/', authenticateJWT, clinicPurchaseRequestController.getAll);

// Admin: Soft delete a pharmacy purchase request (protected)
router.delete('/:id', authenticateJWT, clinicPurchaseRequestController.softDelete);

// Admin: Restore a soft deleted pharmacy purchase request (protected)
router.patch('/:id/restore', authenticateJWT, clinicPurchaseRequestController.restore);

module.exports = router; 