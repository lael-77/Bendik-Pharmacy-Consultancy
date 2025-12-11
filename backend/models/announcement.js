// Get all active announcements (for public display)
async function getActiveAnnouncements(db) {
    const [rows] = await db.query(`
        SELECT id, title, message, type, priority
        FROM announcements
        WHERE isActive = TRUE
        AND (startDate IS NULL OR startDate <= NOW())
        AND (endDate IS NULL OR endDate >= NOW())
        ORDER BY priority DESC, createdAt DESC
    `);
    return rows;
}

// Get all announcements (for admin)
async function getAllAnnouncements(db) {
    const [rows] = await db.query(`
        SELECT * FROM announcements
        ORDER BY priority DESC, createdAt DESC
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

// Create new announcement
async function createAnnouncement(db, data) {
    const {
        title,
        message,
        type = 'info',
        isActive = true,
        priority = 0,
        startDate = null,
        endDate = null
    } = data;

    const [result] = await db.query(`
        INSERT INTO announcements (title, message, type, isActive, priority, startDate, endDate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, message, type, isActive, priority, startDate, endDate]);

    return result.insertId;
}

// Update announcement
async function updateAnnouncement(db, id, data) {
    const {
        title,
        message,
        type,
        isActive,
        priority,
        startDate,
        endDate
    } = data;

    const [result] = await db.query(`
        UPDATE announcements
        SET title = ?, message = ?, type = ?, isActive = ?, priority = ?, startDate = ?, endDate = ?
        WHERE id = ?
    `, [title, message, type, isActive, priority, startDate, endDate, id]);

    return result.affectedRows > 0;
}

// Delete announcement
async function deleteAnnouncement(db, id) {
    const [result] = await db.query(`
        DELETE FROM announcements WHERE id = ?
    `, [id]);

    return result.affectedRows > 0;
}

// Toggle announcement active status
async function toggleAnnouncementStatus(db, id) {
    const [result] = await db.query(`
        UPDATE announcements
        SET isActive = NOT isActive
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

