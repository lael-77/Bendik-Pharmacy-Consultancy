// Sell Listing model for MySQL

async function getAllSellListings(db) {
    const [rows] = await db.query('SELECT * FROM sell_listings');
    return rows;
}

async function getSellListingById(db, id) {
    const [rows] = await db.query('SELECT * FROM sell_listings WHERE id = ?', [id]);
    return rows[0];
}

async function createSellListing(db, data) {
    const { pharmacy_name, owner_name, location, sell_price, contact_email, contact_phone, status } = data;
    const [result] = await db.query(
        'INSERT INTO sell_listings (pharmacy_name, owner_name, location, sell_price, contact_email, contact_phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [pharmacy_name, owner_name, location, sell_price, contact_email, contact_phone, status]
    );
    return result.insertId;
}

async function updateSellListing(db, id, data) {
    const { status } = data;
    const [result] = await db.query('UPDATE sell_listings SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows;
}

module.exports = {
    getAllSellListings,
    getSellListingById,
    createSellListing,
    updateSellListing,
}; 