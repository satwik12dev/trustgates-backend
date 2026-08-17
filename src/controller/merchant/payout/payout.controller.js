const {
    getPayoutAnalytics
} = require(
    "../../../services/merchant/payout/payout.service"
);

const getPayoutAnalyticsController = async (
    req,
    res
) => {

    try {

        const {
            merchantId,
            startDate,
            endDate
        } = req.payoutAnalytics;

        const result =
            await getPayoutAnalytics({
                merchantId,
                startDate,
                endDate
            });

        return res.status(200).json({

            success: true,

            message:
                "Payout analytics fetched successfully.",

            data: {

                merchantId,

                filters: {
                    startDate,
                    endDate
                },

                ...result

            }

        });

    } catch (error) {

        console.error(
            "Get Payout Analytics Controller Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch payout analytics."

        });

    }
};

module.exports = {
    getPayoutAnalyticsController
};