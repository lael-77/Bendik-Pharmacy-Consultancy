// Buy Inquiry model for MySQL

async function getAllBuyInquiries(db) {
    const [rows] = await db.query('SELECT * FROM buy_inquiries');
    return rows;
}

async function getBuyInquiryById(db, id) {
    const [rows] = await db.query('SELECT * FROM buy_inquiries WHERE id = ?', [id]);
    return rows[0];
}

async function createBuyInquiry(db, data) {
    const { full_name, email, phone, location, district, max_budget, status } = data;
    const [result] = await db.query(
        'INSERT INTO buy_inquiries (full_name, email, phone, location, district, max_budget, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [full_name, email, phone, location, district, max_budget, status]
    );
    return result.insertId;
}

async function updateBuyInquiry(db, id, data) {
    const { status } = data;
    const [result] = await db.query('UPDATE buy_inquiries SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows;
}

module.exports = {
    getAllBuyInquiries,
    getBuyInquiryById,
    createBuyInquiry,
    updateBuyInquiry,
}; 