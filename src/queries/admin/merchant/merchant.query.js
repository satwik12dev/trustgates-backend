const merchantQueries = {

    // ==========================================================
    // CREATE MERCHANT
    // ==========================================================

    CREATE_MERCHANT: `
    INSERT INTO merchants (
        merchant_code,
        business_name,
        merchant_name,
        email,
        phone,
        website,
        password_hash,
        approval_status,
        kyc_status,
        account_status
    )
    VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'PENDING',
        'PENDING',
        'HOLD'
    )
`,


    // ==========================================================
    // GENERATE SEQUENTIAL MERCHANT CODE
    //
    // 1      -> 0001
    // 2      -> 0002
    // 10     -> 0010
    // 125    -> 0125
    // 1000   -> 1000
    // ==========================================================
CREATE_MERCHANT_CODE_SEQUENCE: `
    INSERT INTO merchant_code_sequence
    VALUES ()
`,
    UPDATE_MERCHANT_CODE: `
        UPDATE merchants
        SET
            merchant_code = LPAD(merchant_id, 4, '0')
        WHERE merchant_id = ?
          AND deleted_at IS NULL
    `,


    // ==========================================================
    // EMAIL CHECK
    // ==========================================================

    CHECK_EMAIL_EXISTS: `
        SELECT
            merchant_id
        FROM merchants
        WHERE email = ?
          AND deleted_at IS NULL
        LIMIT 1
    `,


    CHECK_EMAIL_EXISTS_FOR_UPDATE: `
        SELECT
            merchant_id
        FROM merchants
        WHERE email = ?
          AND merchant_id <> ?
          AND deleted_at IS NULL
        LIMIT 1
    `,


    // ==========================================================
    // MERCHANT EXISTENCE
    // ==========================================================

    CHECK_MERCHANT_EXISTS: `
        SELECT
            merchant_id,
            merchant_code,
            approval_status,
            kyc_status,
            account_status,
            email_verified,
            deleted_at
        FROM merchants
        WHERE merchant_id = ?
          AND deleted_at IS NULL
        LIMIT 1
    `,


    // ==========================================================
    // MERCHANT LIST
    // ==========================================================

    GET_ALL_MERCHANTS: `
        SELECT
            merchant_id,
            merchant_code,
            business_name,
            merchant_name,
            email,
            phone,
            website,
            approval_status,
            kyc_status,
            account_status,
            email_verified,
            created_at,
            updated_at
        FROM merchants
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC, merchant_id DESC
        LIMIT ? OFFSET ?
    `,


    // ==========================================================
    // COUNT MERCHANTS
    // ==========================================================

    COUNT_ALL_MERCHANTS: `
        SELECT
            COUNT(*) AS total
        FROM merchants
        WHERE deleted_at IS NULL
    `,


    // ==========================================================
    // SEARCH MERCHANTS
    // ==========================================================

    SEARCH_MERCHANTS: `
        SELECT
            merchant_id,
            merchant_code,
            business_name,
            merchant_name,
            email,
            phone,
            website,
            approval_status,
            kyc_status,
            account_status,
            email_verified,
            created_at,
            updated_at
        FROM merchants
        WHERE deleted_at IS NULL
          AND (
                merchant_name LIKE ?
             OR business_name LIKE ?
             OR merchant_code LIKE ?
             OR email LIKE ?
             OR phone LIKE ?
          )
        ORDER BY created_at DESC, merchant_id DESC
        LIMIT ? OFFSET ?
    `,


    // ==========================================================
    // MERCHANT DETAILS
    // ==========================================================

    GET_MERCHANT_BY_ID: `
        SELECT
            merchant_id,
            merchant_code,
            business_name,
            merchant_name,
            email,
            phone,
            website,
            approval_status,
            kyc_status,
            account_status,
            email_verified,
            two_factor_enabled,
            created_at,
            updated_at
        FROM merchants
        WHERE merchant_id = ?
          AND deleted_at IS NULL
        LIMIT 1
    `,


    // ==========================================================
    // UPDATE MERCHANT
    // ==========================================================

    UPDATE_MERCHANT: `
        UPDATE merchants
        SET
            business_name = ?,
            merchant_name = ?,
            phone = ?,
            website = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE merchant_id = ?
          AND deleted_at IS NULL
    `,


    // ==========================================================
    // SOFT DELETE MERCHANT
    // ==========================================================

    DELETE_MERCHANT: `
        UPDATE merchants
        SET
            account_status = 'BLOCKED',
            deleted_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE merchant_id = ?
          AND deleted_at IS NULL
    `,


    // ==========================================================
    // APPROVAL STATUS
    // ==========================================================

    UPDATE_APPROVAL_STATUS: `
        UPDATE merchants
        SET
            approval_status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE merchant_id = ?
          AND deleted_at IS NULL
    `,


    // ==========================================================
    // KYC STATUS
    // ==========================================================

    UPDATE_KYC_STATUS: `
        UPDATE merchants
        SET
            kyc_status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE merchant_id = ?
          AND deleted_at IS NULL
    `,


    // ==========================================================
    // ACCOUNT STATUS
    // ==========================================================

    UPDATE_ACCOUNT_STATUS: `
        UPDATE merchants
        SET
            account_status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE merchant_id = ?
          AND deleted_at IS NULL
    `,


    // ==========================================================
    // CREATE KYC
    // ==========================================================

    CREATE_KYC: `
        INSERT INTO merchant_kyc (
            merchant_id,
            pan_number,
            aadhaar_number,
            pan_document,
            aadhaar_document,
            kyc_status
        )
        VALUES (
            ?, ?, ?, ?, ?, 'PENDING'
        )
    `,


    // ==========================================================
    // CHECK KYC EXISTS
    // ==========================================================

    CHECK_KYC_EXISTS: `
        SELECT
            kyc_id,
            merchant_id,
            kyc_status,
            kyc_resubmission_allowed
        FROM merchant_kyc
        WHERE merchant_id = ?
        LIMIT 1
    `,


    // ==========================================================
    // GET KYC
    //
    // Explicit columns instead of SELECT *
    // ==========================================================

    GET_KYC_BY_MERCHANT: `
        SELECT
            kyc_id,
            merchant_id,
            pan_number,
            aadhaar_number,
            pan_document,
            aadhaar_document,
            kyc_status,
            kyc_resubmission_allowed,
            verification_notes,
            verified_by,
            verified_at,
            created_at,
            updated_at
        FROM merchant_kyc
        WHERE merchant_id = ?
        LIMIT 1
    `,


    // ==========================================================
    // UPDATE KYC STATUS
    // ==========================================================

    UPDATE_KYC_STATUS_DETAILS: `
        UPDATE merchant_kyc
        SET
            kyc_status = ?,
            verification_notes = ?,
            verified_by = ?,
            verified_at = NOW(),
            updated_at = CURRENT_TIMESTAMP
        WHERE merchant_id = ?
    `,


    // ==========================================================
    // APPROVE KYC
    // ==========================================================

    APPROVE_KYC: `
        UPDATE merchant_kyc
        SET
            kyc_status = 'APPROVED',
            kyc_resubmission_allowed = FALSE,
            verification_notes = ?,
            verified_by = ?,
            verified_at = NOW(),
            updated_at = CURRENT_TIMESTAMP
        WHERE merchant_id = ?
          AND kyc_status = 'PENDING'
    `,


    // ==========================================================
    // REJECT KYC
    // ==========================================================

    REJECT_KYC: `
        UPDATE merchant_kyc
        SET
            kyc_status = 'REJECTED',
            kyc_resubmission_allowed = FALSE,
            verification_notes = ?,
            verified_by = ?,
            verified_at = NOW(),
            updated_at = CURRENT_TIMESTAMP
        WHERE merchant_id = ?
          AND kyc_status = 'PENDING'
    `,


    // ==========================================================
    // ENABLE KYC RESUBMISSION
    // ==========================================================

    ALLOW_KYC_RESUBMISSION: `
        UPDATE merchant_kyc
        SET
            kyc_resubmission_allowed = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE merchant_id = ?
          AND kyc_status = 'REJECTED'
    `,


    // ==========================================================
    // RESET KYC FOR RESUBMISSION
    // ==========================================================

    RESET_KYC_FOR_RESUBMISSION: `
        UPDATE merchant_kyc
        SET
            pan_number = ?,
            aadhaar_number = ?,
            pan_document = ?,
            aadhaar_document = ?,
            kyc_status = 'PENDING',
            kyc_resubmission_allowed = FALSE,
            verification_notes = NULL,
            verified_by = NULL,
            verified_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE merchant_id = ?
          AND kyc_status = 'REJECTED'
          AND kyc_resubmission_allowed = TRUE
    `

};


module.exports = merchantQueries;