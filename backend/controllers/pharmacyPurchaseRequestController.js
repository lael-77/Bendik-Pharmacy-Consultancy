const pharmacyPurchaseRequestModel = require('../models/pharmacyPurchaseRequest');

// Get all pharmacy purchase requests
async function getAll(req, res) {
    try {
        const requests = await pharmacyPurchaseRequestModel.getAllPharmacyPurchaseRequests(req.db);
        res.json(requests);
    } catch (err) {
        console.error('Error fetching pharmacy purchase requests:', err);
        res.status(500).json({ error: 'Failed to fetch pharmacy purchase requests' });
    }
}

// Create a new pharmacy purchase request
async function create(req, res) {
    try {
        const id = await pharmacyPurchaseRequestModel.createPharmacyPurchaseRequest(req.db, req.body);
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error creating pharmacy purchase request:', err);
        res.status(500).json({ error: 'Failed to create pharmacy purchase request' });
    }
}

// Soft delete a pharmacy purchase request
async function softDelete(req, res) {
    try {
        const { id } = req.params;
        const success = await pharmacyPurchaseRequestModel.softDeletePharmacyPurchaseRequest(req.db, id);
        if (success) {
            res.json({ message: 'Pharmacy purchase request deleted successfully' });
        } else {
            res.status(404).json({ error: 'Pharmacy purchase request not found' });
        }
    } catch (err) {
        console.error('Error deleting pharmacy purchase request:', err);
        res.status(500).json({ error: 'Failed to delete pharmacy purchase request' });
    }
}

// Restore a soft deleted pharmacy purchase request
async function restore(req, res) {
    try {
        const { id } = req.params;
        const success = await pharmacyPurchaseRequestModel.restorePharmacyPurchaseRequest(req.db, id);
        if (success) {
            res.json({ message: 'Pharmacy purchase request restored successfully' });
        } else {
            res.status(404).json({ error: 'Pharmacy purchase request not found' });
        }
    } catch (err) {
        console.error('Error restoring pharmacy purchase request:', err);
        res.status(500).json({ error: 'Failed to restore pharmacy purchase request' });
    }
}

module.exports = {
    getAll,
    create,
    softDelete,
    restore
}; 