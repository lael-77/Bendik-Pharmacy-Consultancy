const express = require('express');
const router = express.Router();
const pharmacySaleRequestController = require('../controllers/pharmacySaleRequestController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new pharmacy sale request
router.post('/', pharmacySaleRequestController.create);

// Admin: Get all pharmacy sale requests (protected)
router.get('/', authenticateJWT, pharmacySaleRequestController.getAll);

// Admin: Soft delete a pharmacy sale request (protected)
router.delete('/:id', authenticateJWT, pharmacySaleRequestController.softDelete);

// Admin: Restore a soft deleted pharmacy sale request (protected)
router.patch('/:id/restore', authenticateJWT, pharmacySaleRequestController.restore);

module.exports = router; 