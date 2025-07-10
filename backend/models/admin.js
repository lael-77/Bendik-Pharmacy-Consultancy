// Admin model for MySQL

async function findAdminByEmail(db, email) {
    const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    return rows[0];
}

async function createAdmin(db, { email, password }) {
    const [result] = await db.query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, password]);
    return result.insertId;
}

module.exports = {
    findAdminByEmail,
    createAdmin,
}; 