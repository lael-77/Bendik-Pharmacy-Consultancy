const express = require('express');
const router = express.Router();
const buyInquiryController = require('../controllers/buyInquiryController');
const { authenticateJWT } = require('../middlewares/auth');

router.get('/', authenticateJWT, buyInquiryController.getAll);
router.get('/:id', authenticateJWT, buyInquiryController.getById);
router.post('/', authenticateJWT, buyInquiryController.create);
router.put('/:id', authenticateJWT, buyInquiryController.update);

module.exports = router; 