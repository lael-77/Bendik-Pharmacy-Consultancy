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

module.exports = {
    getAll,
    create
}; 