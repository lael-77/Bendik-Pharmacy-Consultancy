const jobApplicationModel = require('../models/jobApplication');

// Get all job applications
async function getAll(req, res) {
    try {
        const applications = await jobApplicationModel.getAllJobApplications(req.db);
        res.json(applications);
    } catch (err) {
        console.error('Error fetching job applications:', err);
        res.status(500).json({ error: 'Failed to fetch job applications' });
    }
}

// Create a new job application
async function create(req, res) {
    try {
        const id = await jobApplicationModel.createJobApplication(req.db, req.body);
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error creating job application:', err);
        res.status(500).json({ error: 'Failed to create job application' });
    }
}

module.exports = {
    getAll,
    create
}; 