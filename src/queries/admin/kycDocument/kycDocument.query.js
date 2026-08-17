const kycDocumentQueries = {

    // ==========================================================
    // Check Merchant Exists
    // ==========================================================

    CHECK_MERCHANT_EXISTS: `
        SELECT

            merchant_id,

            merchant_name,

            account_status

        FROM merchants

        WHERE merchant_id = ?

          AND deleted_at IS NULL

        LIMIT 1
    `,

    // ==========================================================
    // Get Merchant KYC Documents
    // ==========================================================

    GET_KYC_DOCUMENTS: `
        SELECT

            kyc_id,

            merchant_id,

            pan_document,

            aadhaar_document,

            kyc_status,

            created_at,

            updated_at

        FROM merchant_kyc

        WHERE merchant_id = ?

        LIMIT 1
    `,

    // ==========================================================
    // Check KYC Exists
    // ==========================================================

    CHECK_KYC_EXISTS: `
        SELECT

            kyc_id,

            merchant_id,

            kyc_status

        FROM merchant_kyc

        WHERE merchant_id = ?

        LIMIT 1
    `,

    // ==========================================================
    // Get PAN Document Path
    // ==========================================================

    GET_PAN_DOCUMENT: `
        SELECT

            pan_document

        FROM merchant_kyc

        WHERE merchant_id = ?

        LIMIT 1
    `,

    // ==========================================================
    // Get Aadhaar Document Path
    // ==========================================================

    GET_AADHAAR_DOCUMENT: `
        SELECT

            aadhaar_document

        FROM merchant_kyc

        WHERE merchant_id = ?

        LIMIT 1
    `

};

module.exports = kycDocumentQueries;