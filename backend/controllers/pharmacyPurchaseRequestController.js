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

module.exports = {
    getAll,
    create
}; 