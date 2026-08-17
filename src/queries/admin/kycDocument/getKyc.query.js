const GET_ALL_MERCHANT_KYC = `

    SELECT

        mk.kyc_id,
        mk.merchant_id,

        m.merchant_name,
        m.email,
        m.merchant_code,

        mk.pan_number,
        mk.aadhaar_number,

        mk.pan_document,
        mk.aadhaar_document,

        mk.kyc_status,
        mk.kyc_resubmission_allowed,

        mk.verification_notes,

        mk.verified_by,
        mk.verified_at,

        mk.created_at,
        mk.updated_at

    FROM merchant_kyc mk

    INNER JOIN merchants m
        ON mk.merchant_id = m.merchant_id

    ORDER BY mk.created_at DESC

`;


// ==========================================================
// Get KYC By Merchant ID
// ==========================================================

const GET_MERCHANT_KYC_BY_ID = `

    SELECT

        mk.kyc_id,
        mk.merchant_id,

        m.merchant_name,
        m.email,
        m.merchant_code,

        mk.pan_number,
        mk.aadhaar_number,

        mk.pan_document,
        mk.aadhaar_document,

        mk.kyc_status,
        mk.kyc_resubmission_allowed,

        mk.verification_notes,

        mk.verified_by,
        mk.verified_at,

        mk.created_at,
        mk.updated_at

    FROM merchant_kyc mk

    INNER JOIN merchants m
        ON mk.merchant_id = m.merchant_id

    WHERE mk.merchant_id = ?

    LIMIT 1

`;
const GET_KYC_BY_ID = `

    SELECT

        mk.kyc_id,
        mk.merchant_id,

        m.merchant_name,
        m.email,
        m.merchant_code,

        mk.pan_number,
        mk.aadhaar_number,

        mk.pan_document,
        mk.aadhaar_document,

        mk.kyc_status,
        mk.kyc_resubmission_allowed,

        mk.verification_notes,

        mk.verified_by,
        mk.verified_at,

        mk.created_at,
        mk.updated_at

    FROM merchant_kyc mk

    INNER JOIN merchants m
        ON mk.merchant_id = m.merchant_id

    WHERE mk.kyc_id = ?

    LIMIT 1

`;

module.exports = {

    GET_ALL_MERCHANT_KYC,

    GET_MERCHANT_KYC_BY_ID,
    GET_KYC_BY_ID

};