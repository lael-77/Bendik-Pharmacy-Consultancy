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

// Create a new job application with file upload
async function createWithFile(req, res) {
    try {
        // Handle file upload using multer
        req.upload.single('cv')(req, res, async function(err) {
            if (err) {
                console.error('File upload error:', err);
                return res.status(400).json({ error: err.message });
            }

            // Prepare data for database
            const data = {
                ...req.body,
                cv: req.file ? req.file.filename : null
            };

            // Handle arrays for checkboxes and radio groups
            if (req.body.contactMode) {
                data.contactMode = Array.isArray(req.body.contactMode) ? req.body.contactMode : [req.body.contactMode];
            }
            if (req.body.pharmacyType) {
                data.pharmacyType = Array.isArray(req.body.pharmacyType) ? req.body.pharmacyType : [req.body.pharmacyType];
            }
            if (req.body.skills) {
                data.skills = Array.isArray(req.body.skills) ? req.body.skills : [req.body.skills];
            }

            const id = await jobApplicationModel.createJobApplication(req.db, data);
            res.status(201).json({ id });
        });
    } catch (err) {
        console.error('Error creating job application with file:', err);
        res.status(500).json({ error: 'Failed to create job application' });
    }
}

module.exports = {
    getAll,
    create
}; 