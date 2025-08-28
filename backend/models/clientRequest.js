// Client Request model for MySQL

async function getAllClientRequests(db) {
    const [rows] = await db.query('SELECT * FROM client_requests ORDER BY createdAt DESC');
    return rows;
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
    createClientRequest
}; 
