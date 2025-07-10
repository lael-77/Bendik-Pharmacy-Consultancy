const express = require('express');
const router = express.Router();
const sellListingController = require('../controllers/sellListingController');
const { authenticateJWT } = require('../middlewares/auth');

router.get('/', authenticateJWT, sellListingController.getAll);
router.get('/:id', authenticateJWT, sellListingController.getById);
router.post('/', authenticateJWT, sellListingController.create);
router.put('/:id', authenticateJWT, sellListingController.update);

module.exports = router; 