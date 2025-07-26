const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new job application
router.post('/', jobApplicationController.create);

// Admin: Get all job applications (protected)
router.get('/', authenticateJWT, jobApplicationController.getAll);

module.exports = router; 