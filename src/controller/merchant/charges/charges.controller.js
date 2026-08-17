const {
    getMyFees
} = require("../../../services/merchant/charges/charges.service");


// ==========================================================
// Get My Fees
// ==========================================================

const getMerchantFees = async (req, res) => {

    try {

        // ==============================================
        // Get merchant ID from authenticated JWT
        // ==============================================

        const merchantId =
            req.user.merchant_id;


        if (
            !merchantId
        ) {
            return res.status(401).json({

                success: false,

                message:
                    "Merchant authentication required."

            });
        }


        // ==============================================
        // Get only logged-in merchant fees
        // ==============================================

        const fees =
            await getMyFees(
                merchantId
            );


        // ==============================================
        // Response
        // ==============================================

        return res.status(200).json({

            success: true,

            message:
                "Merchant fees fetched successfully.",

            merchantId:
                Number(merchantId),

            count:
                fees.length,

            data:
                fees

        });

    }

    catch (error) {

        console.error(
            "Get Merchant Fees Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error."

        });

    }

};


module.exports = {
    getMerchantFees
};