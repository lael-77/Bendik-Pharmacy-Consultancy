const express = require('express');
const router = express.Router();
const recruitmentRequestController = require('../controllers/recruitmentRequestController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new recruitment request
router.post('/', recruitmentRequestController.create);

// Admin: Get all recruitment requests (protected)
router.get('/', authenticateJWT, recruitmentRequestController.getAll);

module.exports = router; 