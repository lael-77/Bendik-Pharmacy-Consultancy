const express = require('express');
const router = express.Router();
const clientRequestController = require('../controllers/clientRequestController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Submit a new client request
router.post('/', clientRequestController.create);

// Admin: Get all client requests (protected)
router.get('/', authenticateJWT, clientRequestController.getAll);

module.exports = router; 