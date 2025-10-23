// Client Request model for MySQL

async function getAllClientRequests(db) {
    const [rows] = await db.query('SELECT * FROM client_requests WHERE isDeleted = FALSE ORDER BY createdAt DESC');
    return rows;
}

async function getAllClientRequestsIncludingDeleted(db) {
    const [rows] = await db.query('SELECT * FROM client_requests ORDER BY createdAt DESC');
    return rows;
}

async function softDeleteClientRequest(db, id) {
    const [result] = await db.query(
        'UPDATE client_requests SET isDeleted = TRUE, deletedAt = NOW() WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function restoreClientRequest(db, id) {
    const [result] = await db.query(
        'UPDATE client_requests SET isDeleted = FALSE, deletedAt = NULL WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function createClientRequest(db, data) {
    const {
        fullName,
        organizationName,
        businessType,
        nationalId,
        tinNumber,
        location,
        phoneNumber,
        email,
        contactMode,
        services,
        otherService,
        urgency,
        specificDates,
        description,
        PreferedInsurance,
        requireQuotation,
        paymentMode,
        invoicingName,
        declaration,
        signature
    } = data;
    
    // Ensure signature has a value
    const signatureValue = signature || fullName || 'Digital Signature';
    const [result] = await db.query(
        `INSERT INTO client_requests (
            fullName, organizationName, businessType, nationalId, tinNumber, location, phoneNumber, email, contactMode, services, otherService, urgency, specificDates, description, PreferedInsurance, requireQuotation, paymentMode, invoicingName, declaration, signature, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            fullName,
            organizationName,
            businessType,
            nationalId,
            tinNumber,
            location,
            phoneNumber,
            email,
            contactMode,
            Array.isArray(services) ? services.join(',') : services,
            otherService,
            urgency,
            specificDates,
            description,
            PreferedInsurance,
            requireQuotation,
            paymentMode,
            invoicingName,
            declaration,
            signatureValue
        ]
    );
    return result.insertId;
}

module.exports = {
    getAllClientRequests,
    getAllClientRequestsIncludingDeleted,
    softDeleteClientRequest,
    restoreClientRequest,
    createClientRequest
}; 
