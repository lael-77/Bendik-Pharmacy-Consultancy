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
        console.log('Received job application data:', req.body);
        const id = await jobApplicationModel.createJobApplication(req.db, req.body);
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error creating job application:', err);
        res.status(500).json({ error: 'Failed to create job application' });
    }
}

// Soft delete a job application
async function softDelete(req, res) {
    try {
        const { id } = req.params;
        const success = await jobApplicationModel.softDeleteJobApplication(req.db, id);
        if (success) {
            res.json({ message: 'Job application deleted successfully' });
        } else {
            res.status(404).json({ error: 'Job application not found' });
        }
    } catch (err) {
        console.error('Error deleting job application:', err);
        res.status(500).json({ error: 'Failed to delete job application' });
    }
}

// Restore a soft deleted job application
async function restore(req, res) {
    try {
        const { id } = req.params;
        const success = await jobApplicationModel.restoreJobApplication(req.db, id);
        if (success) {
            res.json({ message: 'Job application restored successfully' });
        } else {
            res.status(404).json({ error: 'Job application not found' });
        }
    } catch (err) {
        console.error('Error restoring job application:', err);
        res.status(500).json({ error: 'Failed to restore job application' });
    }
}

module.exports = {
    getAll,
    create,
    softDelete,
    restore
}; 