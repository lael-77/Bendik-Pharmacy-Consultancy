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
    console.log('🔍 Signup attempt for email:', email);
    
    if (!email || !password) {
        console.log('❌ Missing email or password');
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        console.log('🔍 Checking if admin exists...');
        const existing = await findAdminByEmail(req.db, email);
        if (existing) {
            console.log('❌ Email already exists:', email);
            return res.status(409).json({ message: 'Email already exists.' });
        }
        
        console.log('🔍 Hashing password...');
        const hashed = await bcrypt.hash(password, 10);
        
        console.log('🔍 Inserting new admin into database...');
        await req.db.query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashed]);
        
        console.log('✅ Admin created successfully:', email);
        res.status(201).json({ message: 'Admin created successfully.' });
    } catch (err) {
        console.error('❌ Signup error:', err.message);
        console.error('❌ Full error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports = { login };
module.exports.signup = signup; 