// Pharmacy Purchase Request model for MySQL

async function getAllPharmacyPurchaseRequests(db) {
    const [rows] = await db.query('SELECT * FROM pharmacy_purchase_requests ORDER BY createdAt DESC');
    return rows;
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
        date
    } = data;
    const [result] = await db.query(
        `INSERT INTO pharmacy_purchase_requests (
            buyerName, phoneNumber, email, contactMethod, nationalId, tinNumber, pharmacyType, otherType, preferredLocation, operatingArea, businessStatus, ownershipType, minRevenue, budgetRange, budgetFlexible, timeline, insurancePartners, supportServices, otherServices, additionalInfo, date, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
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
            date
        ]
    );
    return result.insertId;
}

module.exports = {
    getAllPharmacyPurchaseRequests,
    createPharmacyPurchaseRequest
}; 