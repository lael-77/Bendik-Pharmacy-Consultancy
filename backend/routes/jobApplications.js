const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new job application
router.post('/', jobApplicationController.create);

// Admin: Get all job applications (protected)
router.get('/', authenticateJWT, jobApplicationController.getAll);

// Admin: Soft delete a job application (protected)
router.delete('/:id', authenticateJWT, jobApplicationController.softDelete);

// Admin: Restore a soft deleted job application (protected)
router.patch('/:id/restore', authenticateJWT, jobApplicationController.restore);

module.exports = router; 