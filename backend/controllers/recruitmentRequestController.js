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

module.exports = {
    getAll,
    create
}; 