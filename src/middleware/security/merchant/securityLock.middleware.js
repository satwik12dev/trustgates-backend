const {
    getMerchantSecurityLock
} = require("../../services/security/securityLock.service");


// ==========================================================
// Check Merchant Security Lock
// ==========================================================
//
// Requires merchantId to be available in:
// req.merchant.merchantId
// OR
// req.merchantId
//
// ==========================================================

const merchantSecurityLock = async (
    req,
    res,
    next
) => {

    try {

        const merchantId =
            req.merchant?.merchantId ||
            req.merchant?.merchant_id ||
            req.merchantId;


        // --------------------------------------------------
        // If no merchant ID
        // --------------------------------------------------

        if (!merchantId) {

            return next();

        }


        const lock =
            await getMerchantSecurityLock(
                merchantId
            );


        // --------------------------------------------------
        // Not locked
        // --------------------------------------------------

        if (!lock) {

            return next();

        }


        // --------------------------------------------------
        // Locked
        // --------------------------------------------------

        return res.status(423).json({

            success: false,

            message:
                "Your account is temporarily locked for security reasons. Please try again later.",

            retryAfter:
                lock.retryAfter

        });


    } catch (error) {

        console.error(
            "Security Lock Middleware Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Security verification failed."

        });

    }

};


module.exports = {
    merchantSecurityLock
};