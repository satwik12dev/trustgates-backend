// ==========================================================
// Merchant Profile Queries
// ==========================================================

const PROFILE_QUERIES = {

    // ======================================================
    // Get Merchant Profile
    // ======================================================

    GET_MERCHANT_PROFILE: `

        SELECT

            merchant_id,
            merchant_code,

            merchant_name,
            business_name,

            email,
            phone,
            website,

            email_verified,
            two_factor_enabled,

            approval_status,
            kyc_status,
            account_status,

            created_at,
            updated_at

        FROM merchants

        WHERE merchant_id = ?

          AND deleted_at IS NULL

        LIMIT 1

    `

};


module.exports = PROFILE_QUERIES;