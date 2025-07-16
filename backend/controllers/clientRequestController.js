const clientRequestModel = require('../models/clientRequest');

// Get all client requests
async function getAll(req, res) {
    try {
        const requests = await clientRequestModel.getAllClientRequests(req.db);
        res.json(requests);
    } catch (err) {
        console.error('Error fetching client requests:', err);
        res.status(500).json({ error: 'Failed to fetch client requests' });
    }
}

// Create a new client request
async function create(req, res) {
    try {
        const id = await clientRequestModel.createClientRequest(req.db, req.body);
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error creating client request:', err);
        res.status(500).json({ error: 'Failed to create client request' });
    }
}

module.exports = {
    getAll,
    create
}; 