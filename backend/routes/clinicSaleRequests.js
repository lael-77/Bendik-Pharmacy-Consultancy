const express = require('express');
const router = express.Router();
const clinicSaleRequestController = require('../controllers/clinicSaleRequestController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new pharmacy sale request
router.post('/', clinicSaleRequestController.create);

// Admin: Get all pharmacy sale requests (protected)
router.get('/', authenticateJWT, clinicSaleRequestController.getAll);

// Admin: Soft delete a pharmacy sale request (protected)
router.delete('/:id', authenticateJWT, clinicSaleRequestController.softDelete);

// Admin: Restore a soft deleted pharmacy sale request (protected)
router.patch('/:id/restore', authenticateJWT, clinicSaleRequestController.restore);

module.exports = router; 