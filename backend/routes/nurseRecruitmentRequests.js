const express = require('express');
const router = express.Router();
const nurseRecruitmentRequestController = require('../controllers/nurseRecruitmentRequestController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new recruitment request
router.post('/', nurseRecruitmentRequestController.create);

// Admin: Get all recruitment requests (protected)
router.get('/', authenticateJWT, nurseRecruitmentRequestController.getAll);

// Admin: Soft delete a recruitment request (protected)
router.delete('/:id', authenticateJWT, nurseRecruitmentRequestController.softDelete);

// Admin: Restore a soft deleted recruitment request (protected)
router.patch('/:id/restore', authenticateJWT, nurseRecruitmentRequestController.restore);

module.exports = router; 