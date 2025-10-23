const express = require('express');
const router = express.Router();
const recruitmentRequestController = require('../controllers/recruitmentRequestController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new recruitment request
router.post('/', recruitmentRequestController.create);

// Admin: Get all recruitment requests (protected)
router.get('/', authenticateJWT, recruitmentRequestController.getAll);

// Admin: Soft delete a recruitment request (protected)
router.delete('/:id', authenticateJWT, recruitmentRequestController.softDelete);

// Admin: Restore a soft deleted recruitment request (protected)
router.patch('/:id/restore', authenticateJWT, recruitmentRequestController.restore);

module.exports = router; 