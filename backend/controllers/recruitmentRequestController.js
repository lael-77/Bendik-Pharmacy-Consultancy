const recruitmentRequestModel = require('../models/recruitmentRequest');

// Get all recruitment requests
async function getAll(req, res) {
    try {
        const requests = await recruitmentRequestModel.getAllRecruitmentRequests(req.db);
        res.json(requests);
    } catch (err) {
        console.error('Error fetching recruitment requests:', err);
        res.status(500).json({ error: 'Failed to fetch recruitment requests' });
    }
}

// Create a new recruitment request
async function create(req, res) {
    try {
        const id = await recruitmentRequestModel.createRecruitmentRequest(req.db, req.body);
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error creating recruitment request:', err);
        res.status(500).json({ error: 'Failed to create recruitment request' });
    }
}

// Soft delete a recruitment request
async function softDelete(req, res) {
    try {
        const { id } = req.params;
        const success = await recruitmentRequestModel.softDeleteRecruitmentRequest(req.db, id);
        if (success) {
            res.json({ message: 'Recruitment request deleted successfully' });
        } else {
            res.status(404).json({ error: 'Recruitment request not found' });
        }
    } catch (err) {
        console.error('Error deleting recruitment request:', err);
        res.status(500).json({ error: 'Failed to delete recruitment request' });
    }
}

// Restore a soft deleted recruitment request
async function restore(req, res) {
    try {
        const { id } = req.params;
        const success = await recruitmentRequestModel.restoreRecruitmentRequest(req.db, id);
        if (success) {
            res.json({ message: 'Recruitment request restored successfully' });
        } else {
            res.status(404).json({ error: 'Recruitment request not found' });
        }
    } catch (err) {
        console.error('Error restoring recruitment request:', err);
        res.status(500).json({ error: 'Failed to restore recruitment request' });
    }
}

module.exports = {
    getAll,
    create,
    softDelete,
    restore
}; 