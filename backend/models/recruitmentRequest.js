// Recruitment Request model for MySQL

async function getAllRecruitmentRequests(db) {
    const [rows] = await db.query('SELECT * FROM recruitment_requests WHERE isDeleted = FALSE ORDER BY createdAt DESC');
    return rows;
}

async function getAllRecruitmentRequestsIncludingDeleted(db) {
    const [rows] = await db.query('SELECT * FROM recruitment_requests ORDER BY createdAt DESC');
    return rows;
}

async function softDeleteRecruitmentRequest(db, id) {
    const [result] = await db.query(
        'UPDATE recruitment_requests SET isDeleted = TRUE, deletedAt = NOW() WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function restoreRecruitmentRequest(db, id) {
    const [result] = await db.query(
        'UPDATE recruitment_requests SET isDeleted = FALSE, deletedAt = NULL WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function createRecruitmentRequest(db, data) {
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
        signatureDate
    } = data;
    
    // Map phoneNumber to phone for database compatibility
    const phone = phoneNumber;
    const [result] = await db.query(
        `INSERT INTO recruitment_requests (
            pharmacyName, contactPerson, phone, email, location, type, typeOther, branches, staffCount, position, positionsAvailable, employmentType, startDate, workingHours, salaryFrom, salaryTo, housingTransport, bonus, bonusDetails, qualification, license, experience, language, otherLanguage, additionalSkills, responsibility1, responsibility2, responsibility3, responsibility4, responsibility5, reportingLine, systemUsed, teamStructure, training, challenges, support, signatureDate, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            pharmacyName,
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
    getAllRecruitmentRequests,
    getAllRecruitmentRequestsIncludingDeleted,
    softDeleteRecruitmentRequest,
    restoreRecruitmentRequest,
    createRecruitmentRequest
};