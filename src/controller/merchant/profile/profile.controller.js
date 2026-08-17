const {
    getMerchantProfile
} = require(
    "../../../services/merchant/profile/profile.service"
);


// ==========================================================
// Get Merchant Profile
// ==========================================================

const getProfile = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Merchant ID from JWT
        // ==================================================

        const merchantId =
            req.user?.merchant_id;


        if (
            !merchantId
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Unauthorized."

            });

        }


        // ==================================================
        // Get Profile
        // ==================================================

        const result =
            await getMerchantProfile(
                merchantId
            );


        return res
            .status(result.statusCode)
            .json(result);

    }

    catch (error) {

        console.error(
            "Get Merchant Profile Error:",
            error
        );


        next(error);

    }

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    getProfile

};