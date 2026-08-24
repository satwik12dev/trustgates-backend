const analyticsValidation = require(
    "../../../validations/admin/analytics.validation"
);

const {
    getDashboardAnalytics,
    getTransactionTrend,
    getRevenueTrend,
    getPaymentMethodDistribution,
    getPaymentProviderDistribution,
    getMerchantPerformance,
    getHourlyTransactions,
    getCurrencyAnalytics,
    getStatusAnalytics
} = require(
    "../../../services/admin/analytics.service"
);


// ==========================================================
// GET COMPLETE ANALYTICS
// GET /admin/analytics
// ==========================================================

const dashboardAnalytics = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Only Supported Parameters
        // ==================================================

        const {
            error,
            value
        } = analyticsValidation.validate(

            {
                limit:
                    req.query.limit
            },

            {
                abortEarly: true,
                convert: true
            }

        );


        if (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.details[0].message

            });

        }


        // ==================================================
        // Get Analytics
        // ==================================================

        const analytics =
            await getDashboardAnalytics({

                limit:
                    value.limit

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Analytics fetched successfully.",

            data: {

                analytics

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET TRANSACTION TREND
// GET /admin/analytics/transaction-trend
// ==========================================================
const transactionTrend = async (
    req,
    res,
    next
) => {

    try {

        const {
            startDate,
            endDate
        } = req.query;


        const trend =
            await getTransactionTrend({
                startDate,
                endDate
            });


        return res.status(200).json({

            success: true,

            message:
                "Transaction trend fetched successfully.",

            data: {

                count:
                    trend.length,

                trend

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET REVENUE TREND
// GET /admin/analytics/revenue-trend
// ==========================================================

const revenueTrend = async (
    req,
    res,
    next
) => {

    try {

        const {
            startDate,
            endDate
        } = req.query;


        const revenue =
            await getRevenueTrend({
                startDate,
                endDate
            });


        return res.status(200).json({

            success: true,

            message:
                "Revenue trend fetched successfully.",

            data: {

                count:
                    revenue.length,

                revenueTrend:
                    revenue

            }

        });

    } catch (error) {

        next(error);

    }

};

// ==========================================================
// GET PAYMENT METHOD DISTRIBUTION
// GET /admin/analytics/payment-methods
// ==========================================================

const paymentMethodDistribution = async (
    req,
    res,
    next
) => {

    try {

        const paymentMethods =
            await getPaymentMethodDistribution();


        return res.status(200).json({

            success: true,

            message:
                "Payment method distribution fetched successfully.",

            data: {

                count:
                    paymentMethods.length,

                paymentMethods

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET PAYMENT PROVIDER DISTRIBUTION
// GET /admin/analytics/payment-providers
// ==========================================================

const paymentProviderDistribution = async (
    req,
    res,
    next
) => {

    try {

        const providers =
            await getPaymentProviderDistribution();


        return res.status(200).json({

            success: true,

            message:
                "Payment provider distribution fetched successfully.",

            data: {

                count:
                    providers.length,

                providers

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET MERCHANT PERFORMANCE
// GET /admin/analytics/merchant-performance
// ==========================================================

const merchantPerformance = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Limit
        // ==================================================

        const {
            error,
            value
        } = analyticsValidation.validate(

            {
                limit:
                    req.query.limit
            },

            {
                abortEarly: true,
                convert: true
            }

        );


        if (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.details[0].message

            });

        }


        // ==================================================
        // Get Merchant Performance
        // ==================================================

        const merchants =
            await getMerchantPerformance({

                limit:
                    value.limit

            });


        return res.status(200).json({

            success: true,

            message:
                "Merchant performance fetched successfully.",

            data: {

                count:
                    merchants.length,

                merchants

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET HOURLY TRANSACTIONS
// GET /admin/analytics/hourly-transactions
// ==========================================================
const hourlyTransactions = async (
    req,
    res,
    next
) => {

    try {

        const {
            date
        } = req.query;


        // ==================================================
        // Validate Date
        // ==================================================

        if (!date) {

            return res.status(400).json({

                success: false,

                message:
                    "date is required."

            });

        }


        // ==================================================
        // Validate Date Format
        // YYYY-MM-DD
        // ==================================================

        const dateRegex =
            /^\d{4}-\d{2}-\d{2}$/;


        if (!dateRegex.test(date)) {

            return res.status(400).json({

                success: false,

                message:
                    "date must be in YYYY-MM-DD format."

            });

        }


        // ==================================================
        // Validate Actual Date
        // ==================================================

        const parsedDate =
            new Date(`${date}T00:00:00`);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid date."

            });

        }


        // ==================================================
        // Get Hourly Transactions
        // ==================================================

        const hourlyData =
            await getHourlyTransactions({

                date

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Hourly transactions fetched successfully.",

            data: {

                date,

                hourlyTransactions:
                    hourlyData

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET CURRENCY ANALYTICS
// GET /admin/analytics/currency
// ==========================================================

const currencyAnalytics = async (
    req,
    res,
    next
) => {

    try {

        const currencies =
            await getCurrencyAnalytics();


        return res.status(200).json({

            success: true,

            message:
                "Currency analytics fetched successfully.",

            data: {

                count:
                    currencies.length,

                currencies

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET STATUS ANALYTICS
// GET /admin/analytics/status
// ==========================================================

const statusAnalytics = async (
    req,
    res,
    next
) => {

    try {

        const statuses =
            await getStatusAnalytics();


        return res.status(200).json({

            success: true,

            message:
                "Transaction status analytics fetched successfully.",

            data: {

                count:
                    statuses.length,

                statuses

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    dashboardAnalytics,

    transactionTrend,

    revenueTrend,

    paymentMethodDistribution,

    paymentProviderDistribution,

    merchantPerformance,

    hourlyTransactions,

    currencyAnalytics,

    statusAnalytics

};