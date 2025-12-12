// Get all announcements intended for public display
// With the simplified schema, this simply returns all rows ordered by creation date.
async function getActiveAnnouncements(db) {
    const [rows] = await db.query(`
        SELECT id, title, message, createdAt
        FROM announcements
        ORDER BY createdAt DESC
    `);
    return rows;
}

// Get all announcements (for admin)
async function getAllAnnouncements(db) {
    const [rows] = await db.query(`
        SELECT * FROM announcements
        ORDER BY createdAt DESC
    `);
    return rows;
}

// Get single announcement by ID
async function getAnnouncementById(db, id) {
    const [rows] = await db.query(`
        SELECT * FROM announcements WHERE id = ?
    `, [id]);
    return rows[0];
}

// Create new announcement (simplified: only title and message)
async function createAnnouncement(db, data) {
    const { title, message } = data;

    const [result] = await db.query(`
        INSERT INTO announcements (title, message)
        VALUES (?, ?)
    `, [title, message]);

    return result.insertId;
}

// Update announcement (simplified: only title and message)
async function updateAnnouncement(db, id, data) {
    const { title, message } = data;

    const [result] = await db.query(`
        UPDATE announcements
        SET title = ?, message = ?
        WHERE id = ?
    `, [title, message, id]);

    return result.affectedRows > 0;
}

// Delete announcement
async function deleteAnnouncement(db, id) {
    const [result] = await db.query(`
        DELETE FROM announcements WHERE id = ?
    `, [id]);

    return result.affectedRows > 0;
}

// Toggle announcement status
// With the simplified schema there is no isActive flag anymore, so this becomes a
// harmless no-op that simply touches updatedAt to avoid breaking existing routes.
async function toggleAnnouncementStatus(db, id) {
    const [result] = await db.query(`
        UPDATE announcements
        SET updatedAt = updatedAt
        WHERE id = ?
    `, [id]);

    return result.affectedRows > 0;
}

module.exports = {
    getActiveAnnouncements,
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus
};

