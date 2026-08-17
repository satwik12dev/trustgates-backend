const pool = require("../config/pool");


// ==========================================================
// Merchant Dashboard Access Middleware
// ==========================================================
//
// Authentication:
// authenticate middleware handles JWT.
//
// Authorization:
// This middleware handles whether the merchant is actually
// allowed to access protected dashboard resources.
//
// Requirements:
//
// email_verified = TRUE
// kyc_status      = APPROVED
// account_status  = ACTIVE
//
// ==========================================================


const checkDashboardAccess = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // 1. Merchant ID must come from authenticated JWT
        // ==================================================

        const merchantId =
            req.user?.merchant_id ||
            req.user?.merchantId;


        if (
            !merchantId ||
            !Number.isInteger(
                Number(merchantId)
            )
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Unauthorized."

            });

        }


        // ==================================================
        // 2. Get Current Merchant Status
        // ==================================================
        //
        // Do NOT trust status coming from frontend/JWT.
        //
        // Always check current DB state.
        //
        // ==================================================

        const [
            rows
        ] = await pool.query(

            `
                SELECT

                    merchant_id,

                    email_verified,

                    kyc_status,

                    account_status,

                    approval_status

                FROM merchants

                WHERE merchant_id = ?

                  AND deleted_at IS NULL

                LIMIT 1
            `,

            [
                Number(merchantId)
            ]

        );


        // ==================================================
        // 3. Merchant Not Found
        // ==================================================

        if (
            !rows.length
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Merchant account not found."

            });

        }


        const merchant =
            rows[0];


        // ==================================================
        // 4. Email Verification
        // ==================================================

        if (
            !Boolean(
                merchant.email_verified
            )
        ) {

            return res.status(403).json({

                success: false,

                code:
                    "EMAIL_NOT_VERIFIED",

                message:
                    "Please verify your email first."

            });

        }


        // ==================================================
        // 5. KYC Status
        // ==================================================

        if (
            merchant.kyc_status !==
            "APPROVED"
        ) {

            // ----------------------------------------------
            // KYC Pending
            // ----------------------------------------------

            if (
                merchant.kyc_status ===
                "PENDING"
            ) {

                return res.status(403).json({

                    success: false,

                    code:
                        "KYC_PENDING",

                    message:
                        "Your KYC is pending need admin approval."

                });

            }


            // ----------------------------------------------
            // KYC Rejected
            // ----------------------------------------------

            if (
                merchant.kyc_status ===
                "REJECTED"
            ) {

                return res.status(403).json({

                    success: false,

                    code:
                        "KYC_REJECTED",

                    message:
                        "Your KYC has been rejected. Contaxt Admin"

                });

            }


            // ----------------------------------------------
            // Unknown KYC state
            // ----------------------------------------------

            return res.status(403).json({

                success: false,

                code:
                    "KYC_NOT_APPROVED",

                message:
                    "Your KYC has is processing."

            });

        }


        // ==================================================
        // 6. Account Status
        // ==================================================

        if (
            merchant.account_status !==
            "ACTIVE"
        ) {

            return res.status(403).json({

                success: false,

                code:
                    "ACCOUNT_NOT_ACTIVE",

                message:
                    "Your account is under reviwe."

            });

        }


        // ==================================================
        // 7. Approval Status
        // ==================================================

        if (
            merchant.approval_status !==
            "APPROVED"
        ) {

            return res.status(403).json({

                success: false,

                code:
                    "ACCOUNT_NOT_APPROVED",

                message:
                    "Your account is pending and needs admin approval."

            });

        }


        // ==================================================
        // 8. Attach Current Merchant State
        // ==================================================

        req.merchantAccess = {

            merchantId:
                merchant.merchant_id,

            emailVerified:
                Boolean(
                    merchant.email_verified
                ),

            kycStatus:
                merchant.kyc_status,

            accountStatus:
                merchant.account_status,

            approvalStatus:
                merchant.approval_status

        };


        // ==================================================
        // 9. Allow Request
        // ==================================================

        next();


    } catch (error) {

        console.error(
            "Dashboard Access Middleware Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to verify dashboard access."

        });

    }

};


module.exports = {
    checkDashboardAccess
};