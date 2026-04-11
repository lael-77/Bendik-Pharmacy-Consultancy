// Pharmacy Purchase Request model for MySQL

async function getAllClinicPurchaseRequests(db) {
    const [rows] = await db.query('SELECT * FROM clinic_purchase_requests WHERE isDeleted = FALSE ORDER BY createdAt DESC');
    return rows;
}

async function getAllClinicPurchaseRequestsIncludingDeleted(db) {
    const [rows] = await db.query('SELECT * FROM clinic_purchase_requests ORDER BY createdAt DESC');
    return rows;
}

async function softDeleteClinicPurchaseRequest(db, id) {
    const [result] = await db.query(
        'UPDATE clinic_purchase_requests SET isDeleted = TRUE, deletedAt = NOW() WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function restoreClinicPurchaseRequest(db, id) {
    const [result] = await db.query(
        'UPDATE clinic_purchase_requests SET isDeleted = FALSE, deletedAt = NULL WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function createClinicPurchaseRequest(db, data) {
    const {
        buyerName,
        phoneNumber,
        email,
        contactMethod,
        nationalId,
        tinNumber,
        pharmacyType,
        otherType,
        preferredLocation,
        operatingArea,
        businessStatus,
        ownershipType,
        minRevenue,
        budgetRange,
        budgetFlexible,
        timeline,
        insurancePartners,
        supportServices,
        otherServices,
        additionalInfo,
        date,
        clientSignature
    } = data;
    const computedClientSignature = clientSignature || buyerName || '';
    const [result] = await db.query(
        `INSERT INTO clinic_purchase_requests (
            buyerName, phoneNumber, email, contactMethod, nationalId, tinNumber, pharmacyType, otherType, preferredLocation, operatingArea, businessStatus, ownershipType, minRevenue, budgetRange, budgetFlexible, timeline, insurancePartners, supportServices, otherServices, additionalInfo, clientSignature, date, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            buyerName,
            phoneNumber,
            email,
            contactMethod,
            nationalId,
            tinNumber,
            Array.isArray(pharmacyType) ? pharmacyType.join(',') : pharmacyType,
            otherType,
            preferredLocation,
            operatingArea,
            businessStatus,
            ownershipType,
            minRevenue,
            budgetRange,
            budgetFlexible,
            timeline,
            insurancePartners,
            Array.isArray(supportServices) ? supportServices.join(',') : supportServices,
            otherServices,
            additionalInfo,
            computedClientSignature,
            date
        ]
    );
    return result.insertId;
}

module.exports = {
    getAllClinicPurchaseRequests,
    getAllClinicPurchaseRequestsIncludingDeleted,
    softDeleteClinicPurchaseRequest,
    restoreClinicPurchaseRequest,
    createClinicPurchaseRequest
}; 