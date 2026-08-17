const {
    getPayinAnalytics
} = require("../../../services/merchant/payin/payin.service");


// ==========================================================
// Get Merchant Payin Analytics
// ==========================================================

const getPayinAnalyticsController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Authentication
        // ==================================================

        const merchantId =
            req.user?.merchant_id;

        if (
            !merchantId ||
            !Number.isInteger(
                Number(merchantId)
            ) ||
            Number(merchantId) <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Merchant authentication required."

            });

        }


        // ==================================================
        // Validated Analytics Filters
        // ==================================================

        const {
            startDate,
            endDate
        } =
            req.payinAnalytics || {
                startDate: null,
                endDate: null
            };


        // ==================================================
        // Fetch Analytics
        // ==================================================

        const analytics =
            await getPayinAnalytics({

                merchantId:
                    Number(merchantId),

                startDate,

                endDate

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            statusCode: 200,

            message:
                "Payin analytics fetched successfully.",

            data: analytics

        });

    } catch (error) {

        console.error(
            "Get Payin Analytics Controller Error:",
            error
        );

        next(error);

    }

};


module.exports = {

    getPayinAnalyticsController

};