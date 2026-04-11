const express = require('express');
const router = express.Router();
const nurseJobApplicationController = require('../controllers/nurseJobApplicationController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new job application
router.post('/', nurseJobApplicationController.create);

// Admin: Get all job applications (protected)
router.get('/', authenticateJWT, nurseJobApplicationController.getAll);

// Admin: Soft delete a job application (protected)
router.delete('/:id', authenticateJWT, nurseJobApplicationController.softDelete);

// Admin: Restore a soft deleted job application (protected)
router.patch('/:id/restore', authenticateJWT, nurseJobApplicationController.restore);

module.exports = router; 