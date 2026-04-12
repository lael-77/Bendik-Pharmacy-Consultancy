// Recruitment Request model for MySQL

async function getAllNurseRecruitmentRequests(db) {
    const [rows] = await db.query('SELECT * FROM nurse_recruitment_requests WHERE isDeleted = FALSE ORDER BY createdAt DESC');
    return rows;
}

async function getAllNurseRecruitmentRequestsIncludingDeleted(db) {
    const [rows] = await db.query('SELECT * FROM nurse_recruitment_requests ORDER BY createdAt DESC');
    return rows;
}

async function softDeleteNurseRecruitmentRequest(db, id) {
    const [result] = await db.query(
        'UPDATE nurse_recruitment_requests SET isDeleted = TRUE, deletedAt = NOW() WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function restoreNurseRecruitmentRequest(db, id) {
    const [result] = await db.query(
        'UPDATE nurse_recruitment_requests SET isDeleted = FALSE, deletedAt = NULL WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function createNurseRecruitmentRequest(db, data) {
    const {
        pharmacyName,
        contactPerson,
        phoneNumber,
        email,
        location,
        type,
        typeOther,
        branches,
        staffCount,
        position,
        positionsAvailable,
        employmentType,
        startDate,
        workingHours,
        salaryFrom,
        salaryTo,
        housingTransport,
        bonus,
        bonusDetails,
        qualification,
        license,
        experience,
        language,
        otherLanguage,
        additionalSkills,
        responsibility1,
        responsibility2,
        responsibility3,
        responsibility4,
        responsibility5,
        reportingLine,
        systemUsed,
        teamStructure,
        training,
        challenges,
        support,
        signatureDate,
        clinicName
    } = data;
    
    // Map phoneNumber to phone for database compatibility if originally mismatched
    const phone = phoneNumber;
    const finalPharmacyName = pharmacyName || clinicName;
    const [result] = await db.query(
        `INSERT INTO nurse_recruitment_requests (
            pharmacyName, contactPerson, phoneNumber, email, location, type, typeOther, branches, staffCount, position, positionsAvailable, employmentType, startDate, workingHours, salaryFrom, salaryTo, housingTransport, bonus, bonusDetails, qualification, license, experience, language, otherLanguage, additionalSkills, responsibility1, responsibility2, responsibility3, responsibility4, responsibility5, reportingLine, systemUsed, teamStructure, training, challenges, support, signatureDate, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            finalPharmacyName,
            contactPerson,
            phone,
            email,
            location,
            Array.isArray(type) ? type.join(',') : type,
            typeOther,
            branches,
            staffCount,
            position,
            positionsAvailable,
            employmentType,
            startDate,
            workingHours,
            salaryFrom,
            salaryTo,
            housingTransport,
            bonus,
            bonusDetails,
            Array.isArray(qualification) ? qualification.join(',') : qualification,
            Array.isArray(license) ? license.join(',') : license,
            experience,
            Array.isArray(language) ? language.join(',') : language,
            otherLanguage,
            additionalSkills,
            responsibility1,
            responsibility2,
            responsibility3,
            responsibility4,
            responsibility5,
            reportingLine,
            systemUsed,
            teamStructure,
            training,
            challenges,
            Array.isArray(support) ? support.join(',') : support,
            signatureDate
        ]
    );
    return result.insertId;
}

module.exports = {
    getAllNurseRecruitmentRequests,
    getAllNurseRecruitmentRequestsIncludingDeleted,
    softDeleteNurseRecruitmentRequest,
    restoreNurseRecruitmentRequest,
    createNurseRecruitmentRequest
};