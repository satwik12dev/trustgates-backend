const pool = require("../../../config/pool");

const PROFILE_QUERIES =
    require("../../../queries/merchant/profile/profile.user");


// ==========================================================
// Get Merchant Profile
// ==========================================================

const getMerchantProfile = async (
    merchantId
) => {

    // ======================================================
    // 1. Validate Merchant ID
    // ======================================================

    const numericMerchantId =
        Number(merchantId);


    if (
        !Number.isInteger(numericMerchantId) ||
        numericMerchantId <= 0
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid merchant ID."

        };

    }


    // ======================================================
    // 2. Get Merchant
    // ======================================================

    const [
        rows
    ] = await pool.query(

        PROFILE_QUERIES.GET_MERCHANT_PROFILE,

        [
            numericMerchantId
        ]

    );


    // ======================================================
    // 3. Merchant Not Found
    // ======================================================

    if (
        !rows.length
    ) {

        return {

            success: false,

            statusCode: 404,

            message:
                "Merchant profile not found."

        };

    }


    const merchant =
        rows[0];


    // ======================================================
    // 4. Response Data
    // ======================================================

    return {

        success: true,

        statusCode: 200,

        message:
            "Merchant profile fetched successfully.",

        data: {

            merchantId:
                merchant.merchant_id,

            merchantCode:
                merchant.merchant_code,

            merchantName:
                merchant.merchant_name,

            businessName:
                merchant.business_name,

            email:
                merchant.email,

            phone:
                merchant.phone,

            website:
                merchant.website,

            emailVerified:
                Boolean(
                    merchant.email_verified
                ),

            twoFactorEnabled:
                Boolean(
                    merchant.two_factor_enabled
                ),

            approvalStatus:
                merchant.approval_status,

            kycStatus:
                merchant.kyc_status,

            accountStatus:
                merchant.account_status,

            createdAt:
                merchant.created_at,

            updatedAt:
                merchant.updated_at

        }

    };

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    getMerchantProfile

};