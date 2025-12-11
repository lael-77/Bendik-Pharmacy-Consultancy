const announcementModel = require('../models/announcement');

// Get all active announcements (public)
async function getActive(req, res) {
    try {
        const announcements = await announcementModel.getActiveAnnouncements(req.db);
        res.json(announcements);
    } catch (err) {
        console.error('Error fetching active announcements:', err);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
}

// Get all announcements (admin)
async function getAll(req, res) {
    try {
        const announcements = await announcementModel.getAllAnnouncements(req.db);
        res.json(announcements);
    } catch (err) {
        console.error('Error fetching announcements:', err);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
}

// Get single announcement
async function getById(req, res) {
    try {
        const { id } = req.params;
        const announcement = await announcementModel.getAnnouncementById(req.db, id);
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        res.json(announcement);
    } catch (err) {
        console.error('Error fetching announcement:', err);
        res.status(500).json({ error: 'Failed to fetch announcement' });
    }
}

// Create announcement
async function create(req, res) {
    try {
        const id = await announcementModel.createAnnouncement(req.db, req.body);
        res.status(201).json({ id, message: 'Announcement created successfully' });
    } catch (err) {
        console.error('Error creating announcement:', err);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
}

// Update announcement
async function update(req, res) {
    try {
        const { id } = req.params;
        const success = await announcementModel.updateAnnouncement(req.db, id, req.body);
        if (success) {
            res.json({ message: 'Announcement updated successfully' });
        } else {
            res.status(404).json({ error: 'Announcement not found' });
        }
    } catch (err) {
        console.error('Error updating announcement:', err);
        res.status(500).json({ error: 'Failed to update announcement' });
    }
}

// Delete announcement
async function remove(req, res) {
    try {
        const { id } = req.params;
        const success = await announcementModel.deleteAnnouncement(req.db, id);
        if (success) {
            res.json({ message: 'Announcement deleted successfully' });
        } else {
            res.status(404).json({ error: 'Announcement not found' });
        }
    } catch (err) {
        console.error('Error deleting announcement:', err);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
}

// Toggle announcement status
async function toggleStatus(req, res) {
    try {
        const { id } = req.params;
        const success = await announcementModel.toggleAnnouncementStatus(req.db, id);
        if (success) {
            res.json({ message: 'Announcement status toggled successfully' });
        } else {
            res.status(404).json({ error: 'Announcement not found' });
        }
    } catch (err) {
        console.error('Error toggling announcement status:', err);
        res.status(500).json({ error: 'Failed to toggle announcement status' });
    }
}

module.exports = {
    getActive,
    getAll,
    getById,
    create,
    update,
    remove,
    toggleStatus
};

