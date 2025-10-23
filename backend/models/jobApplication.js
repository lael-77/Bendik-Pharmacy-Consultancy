// Job Application model for MySQL

async function getAllJobApplications(db) {
    const [rows] = await db.query('SELECT * FROM job_applications WHERE isDeleted = FALSE ORDER BY createdAt DESC');
    return rows;
}

async function getAllJobApplicationsIncludingDeleted(db) {
    const [rows] = await db.query('SELECT * FROM job_applications ORDER BY createdAt DESC');
    return rows;
}

async function softDeleteJobApplication(db, id) {
    const [result] = await db.query(
        'UPDATE job_applications SET isDeleted = TRUE, deletedAt = NOW() WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function restoreJobApplication(db, id) {
    const [result] = await db.query(
        'UPDATE job_applications SET isDeleted = FALSE, deletedAt = NULL WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function createJobApplication(db, data) {
    const {
        fullName,
        dob,
        nationality,
        idNumber,
        npcNumber,
        phoneNumber,
        email,
        contactMode,
        position,
        otherPosition,
        licenseStatus,
        qualification,
        institution,
        graduationYear,
        experience,
        pharmacyType,
        schedule,
        locationPref,
        relocate,
        salaryFrom,
        salaryTo,
        startDate,
        skills,
        otherSkills,
        employer1,
        position1,
        duration1,
        reason1,
        refName1,
        refRelation1,
        refPhone1,
        signature,
        signatureDate
    } = data;
    
    // Map phoneNumber to phone for database compatibility
    const phone = phoneNumber;
    
    // Ensure signature has a value
    const signatureValue = signature || fullName || 'Digital Signature';
    const [result] = await db.query(
        `INSERT INTO job_applications (
            fullName, dob, nationality, idNumber, npcNumber, phone, email, contactMode, position, otherPosition, licenseStatus, qualification, institution, graduationYear, experience, pharmacyType, schedule, locationPref, relocate, salaryFrom, salaryTo, startDate, skills, otherSkills, employer1, position1, duration1, reason1, refName1, refRelation1, refPhone1, signature, signatureDate, cv, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            fullName,
            dob,
            nationality,
            idNumber,
            npcNumber,
            phone,
            email,
            Array.isArray(contactMode) ? contactMode.join(',') : contactMode,
            position,
            otherPosition,
            licenseStatus,
            qualification,
            institution,
            graduationYear,
            experience,
            Array.isArray(pharmacyType) ? pharmacyType.join(',') : pharmacyType,
            schedule,
            locationPref,
            relocate,
            salaryFrom,
            salaryTo,
            startDate,
            Array.isArray(skills) ? skills.join(',') : skills,
            otherSkills,
            employer1,
            position1,
            duration1,
            reason1,
            refName1,
            refRelation1,
            refPhone1,
            signatureValue,
            signatureDate,
            null // cv column value
        ]
    );
    return result.insertId;
}

module.exports = {
    getAllJobApplications,
    getAllJobApplicationsIncludingDeleted,
    softDeleteJobApplication,
    restoreJobApplication,
    createJobApplication
};