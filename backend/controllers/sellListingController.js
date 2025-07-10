const sellListingModel = require('../models/sellListing');

async function getAll(req, res) {
    try {
        const listings = await sellListingModel.getAllSellListings(req.db);
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function getById(req, res) {
    try {
        const listing = await sellListingModel.getSellListingById(req.db, req.params.id);
        if (!listing) return res.status(404).json({ message: 'Not found' });
        res.json(listing);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function create(req, res) {
    try {
        const id = await sellListingModel.createSellListing(req.db, req.body);
        res.status(201).json({ id });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function update(req, res) {
    try {
        const affected = await sellListingModel.updateSellListing(req.db, req.params.id, req.body);
        if (!affected) return res.status(404).json({ message: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports = { getAll, getById, create, update }; 