const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticateJWT } = require('../middlewares/auth');

// Public: Get active announcements
router.get('/active', announcementController.getActive);

// Admin: Get all announcements (protected)
router.get('/', authenticateJWT, announcementController.getAll);

// Admin: Get single announcement (protected)
router.get('/:id', authenticateJWT, announcementController.getById);

// Admin: Create announcement (protected)
router.post('/', authenticateJWT, announcementController.create);

// Admin: Update announcement (protected)
router.put('/:id', authenticateJWT, announcementController.update);

// Admin: Delete announcement (protected)
router.delete('/:id', authenticateJWT, announcementController.remove);

// Admin: Toggle announcement status (protected)
router.patch('/:id/toggle', authenticateJWT, announcementController.toggleStatus);

module.exports = router;

