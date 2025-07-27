const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new job application with file upload
router.post('/', (req, res, next) => {
    req.upload.single('cv')(req, res, (err) => {
        if (err) {
            console.error('File upload error:', err);
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, jobApplicationController.createWithFile);

// Admin: Get all job applications (protected)
router.get('/', authenticateJWT, jobApplicationController.getAll);

module.exports = router; 