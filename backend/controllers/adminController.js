const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { findAdminByEmail } = require('../models/admin');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const admin = await findAdminByEmail(req.db, email);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function signup(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const existing = await findAdminByEmail(req.db, email);
        if (existing) {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        const hashed = await bcrypt.hash(password, 10);
        await req.db.query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashed]);
        res.status(201).json({ message: 'Admin created successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports = { login };
module.exports.signup = signup; 