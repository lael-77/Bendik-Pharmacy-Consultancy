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

// Soft delete a client request
async function softDelete(req, res) {
    try {
        const { id } = req.params;
        const success = await clientRequestModel.softDeleteClientRequest(req.db, id);
        if (success) {
            res.json({ message: 'Client request deleted successfully' });
        } else {
            res.status(404).json({ error: 'Client request not found' });
        }
    } catch (err) {
        console.error('Error deleting client request:', err);
        res.status(500).json({ error: 'Failed to delete client request' });
    }
}

// Restore a soft deleted client request
async function restore(req, res) {
    try {
        const { id } = req.params;
        const success = await clientRequestModel.restoreClientRequest(req.db, id);
        if (success) {
            res.json({ message: 'Client request restored successfully' });
        } else {
            res.status(404).json({ error: 'Client request not found' });
        }
    } catch (err) {
        console.error('Error restoring client request:', err);
        res.status(500).json({ error: 'Failed to restore client request' });
    }
}

module.exports = {
    getAll,
    create,
    softDelete,
    restore
}; 