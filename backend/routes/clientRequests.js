const express = require('express');
const router = express.Router();
const clientRequestController = require('../controllers/clientRequestController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new client request
router.post('/', clientRequestController.create);

// Admin: Get all client requests (protected)
router.get('/', authenticateJWT, clientRequestController.getAll);

// Admin: Soft delete a client request (protected)
router.delete('/:id', authenticateJWT, clientRequestController.softDelete);

// Admin: Restore a soft deleted client request (protected)
router.patch('/:id/restore', authenticateJWT, clientRequestController.restore);

module.exports = router; 