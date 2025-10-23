// Pharmacy Purchase Request model for MySQL

async function getAllPharmacyPurchaseRequests(db) {
    const [rows] = await db.query('SELECT * FROM pharmacy_purchase_requests WHERE isDeleted = FALSE ORDER BY createdAt DESC');
    return rows;
}

async function getAllPharmacyPurchaseRequestsIncludingDeleted(db) {
    const [rows] = await db.query('SELECT * FROM pharmacy_purchase_requests ORDER BY createdAt DESC');
    return rows;
}

async function softDeletePharmacyPurchaseRequest(db, id) {
    const [result] = await db.query(
        'UPDATE pharmacy_purchase_requests SET isDeleted = TRUE, deletedAt = NOW() WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function restorePharmacyPurchaseRequest(db, id) {
    const [result] = await db.query(
        'UPDATE pharmacy_purchase_requests SET isDeleted = FALSE, deletedAt = NULL WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function createPharmacyPurchaseRequest(db, data) {
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
        `INSERT INTO pharmacy_purchase_requests (
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
    getAllPharmacyPurchaseRequests,
    getAllPharmacyPurchaseRequestsIncludingDeleted,
    softDeletePharmacyPurchaseRequest,
    restorePharmacyPurchaseRequest,
    createPharmacyPurchaseRequest
}; 