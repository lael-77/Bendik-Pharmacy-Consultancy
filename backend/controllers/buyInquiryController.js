const buyInquiryModel = require('../models/buyInquiry');

async function getAll(req, res) {
    try {
        const inquiries = await buyInquiryModel.getAllBuyInquiries(req.db);
        res.json(inquiries);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function getById(req, res) {
    try {
        const inquiry = await buyInquiryModel.getBuyInquiryById(req.db, req.params.id);
        if (!inquiry) return res.status(404).json({ message: 'Not found' });
        res.json(inquiry);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function create(req, res) {
    try {
        const id = await buyInquiryModel.createBuyInquiry(req.db, req.body);
        res.status(201).json({ id });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function update(req, res) {
    try {
        const affected = await buyInquiryModel.updateBuyInquiry(req.db, req.params.id, req.body);
        if (!affected) return res.status(404).json({ message: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports = { getAll, getById, create, update }; 