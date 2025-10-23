const pharmacySaleRequestModel = require('../models/pharmacySaleRequest');

// Get all pharmacy sale requests
async function getAll(req, res) {
    try {
        const requests = await pharmacySaleRequestModel.getAllPharmacySaleRequests(req.db);
        res.json(requests);
    } catch (err) {
        console.error('Error fetching pharmacy sale requests:', err);
        res.status(500).json({ error: 'Failed to fetch pharmacy sale requests' });
    }
}

// Create a new pharmacy sale request
async function create(req, res) {
    try {
        const id = await pharmacySaleRequestModel.createPharmacySaleRequest(req.db, req.body);
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error creating pharmacy sale request:', err);
        res.status(500).json({ error: 'Failed to create pharmacy sale request' });
    }
}

// Soft delete a pharmacy sale request
async function softDelete(req, res) {
    try {
        const { id } = req.params;
        const success = await pharmacySaleRequestModel.softDeletePharmacySaleRequest(req.db, id);
        if (success) {
            res.json({ message: 'Pharmacy sale request deleted successfully' });
        } else {
            res.status(404).json({ error: 'Pharmacy sale request not found' });
        }
    } catch (err) {
        console.error('Error deleting pharmacy sale request:', err);
        res.status(500).json({ error: 'Failed to delete pharmacy sale request' });
    }
}

// Restore a soft deleted pharmacy sale request
async function restore(req, res) {
    try {
        const { id } = req.params;
        const success = await pharmacySaleRequestModel.restorePharmacySaleRequest(req.db, id);
        if (success) {
            res.json({ message: 'Pharmacy sale request restored successfully' });
        } else {
            res.status(404).json({ error: 'Pharmacy sale request not found' });
        }
    } catch (err) {
        console.error('Error restoring pharmacy sale request:', err);
        res.status(500).json({ error: 'Failed to restore pharmacy sale request' });
    }
}

module.exports = {
    getAll,
    create,
    softDelete,
    restore
}; 