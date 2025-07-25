// Pharmacy Sale Request model for MySQL

async function getAllPharmacySaleRequests(db) {
    const [rows] = await db.query('SELECT * FROM pharmacy_sale_requests ORDER BY createdAt DESC');
    return rows;
}

async function createPharmacySaleRequest(db, data) {
    const {
        ownerName,
        phoneNumber,
        email,
        contactMode,
        pharmacyName,
        businessType,
        location,
        ownershipType,
        premisesSize,
        licenseStatus,
        years,
        salesRange,
        insurancePartners,
        staffCount,
        inventoryValue,
        equipmentIncluded,
        reason,
        debts,
        debtAmount,
        price,
        negotiable,
        timeline,
        valuationService,
        additionalInfo,
        documents,
        signature,
        date
    } = data;
    const [result] = await db.query(
        `INSERT INTO pharmacy_sale_requests (
            ownerName, phoneNumber, email, contactMode, pharmacyName, businessType, location, ownershipType, premisesSize, licenseStatus, years, salesRange, insurancePartners, staffCount, inventoryValue, equipmentIncluded, reason, debts, debtAmount, price, negotiable, timeline, valuationService, additionalInfo, documents, signature, date, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            ownerName,
            phoneNumber,
            email,
            contactMode,
            pharmacyName,
            businessType,
            location,
            ownershipType,
            premisesSize,
            licenseStatus,
            years,
            salesRange,
            insurancePartners,
            staffCount,
            inventoryValue,
            equipmentIncluded,
            reason,
            debts,
            debtAmount,
            price,
            negotiable,
            timeline,
            valuationService,
            additionalInfo,
            Array.isArray(documents) ? documents.join(',') : documents,
            signature,
            date
        ]
    );
    return result.insertId;
}

module.exports = {
    getAllPharmacySaleRequests,
    createPharmacySaleRequest
}; 