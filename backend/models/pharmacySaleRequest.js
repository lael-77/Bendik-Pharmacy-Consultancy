// Pharmacy Sale Request model for MySQL

async function getAllPharmacySaleRequests(db) {
    const [rows] = await db.query('SELECT * FROM pharmacy_sale_requests WHERE isDeleted = FALSE ORDER BY createdAt DESC');
    return rows;
}

async function getAllPharmacySaleRequestsIncludingDeleted(db) {
    const [rows] = await db.query('SELECT * FROM pharmacy_sale_requests ORDER BY createdAt DESC');
    return rows;
}

async function softDeletePharmacySaleRequest(db, id) {
    const [result] = await db.query(
        'UPDATE pharmacy_sale_requests SET isDeleted = TRUE, deletedAt = NOW() WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function restorePharmacySaleRequest(db, id) {
    const [result] = await db.query(
        'UPDATE pharmacy_sale_requests SET isDeleted = FALSE, deletedAt = NULL WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
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
        date,
        signature
    } = data;
    
    // Ensure signature has a value - use ownerName as fallback if signature is not provided
    const signatureValue = signature || ownerName || 'Digital Signature';
    
    try {
        // First try with signature column
        const [result] = await db.query(
            `INSERT INTO pharmacy_sale_requests (
                ownerName, phoneNumber, email, contactMode, pharmacyName, businessType, location, ownershipType, premisesSize, licenseStatus, years, salesRange, insurancePartners, staffCount, inventoryValue, equipmentIncluded, reason, debts, debtAmount, price, negotiable, timeline, valuationService, additionalInfo, documents, date, signature, createdAt
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
                date,
                signatureValue
            ]
        );
        return result.insertId;
    } catch (error) {
        // If signature column doesn't exist, try without it
        if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('signature')) {
            console.log('⚠️ signature column not found, inserting without signature field');
            const [result] = await db.query(
                `INSERT INTO pharmacy_sale_requests (
                    ownerName, phoneNumber, email, contactMode, pharmacyName, businessType, location, ownershipType, premisesSize, licenseStatus, years, salesRange, insurancePartners, staffCount, inventoryValue, equipmentIncluded, reason, debts, debtAmount, price, negotiable, timeline, valuationService, additionalInfo, documents, date, createdAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
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
                    date
                ]
            );
            return result.insertId;
        } else {
            // Re-throw other errors
            throw error;
        }
    }
}

module.exports = {
    getAllPharmacySaleRequests,
    getAllPharmacySaleRequestsIncludingDeleted,
    softDeletePharmacySaleRequest,
    restorePharmacySaleRequest,
    createPharmacySaleRequest
};