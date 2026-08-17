
const analyticsValidation= require("../../../validations/admin/analytics.validation");
const {
    buildDateRange
} = require("../../../services/admin/dashboard.service");
const {
    getDashboardAnalytics,
    getAnalyticsOverview,
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
// ==========================================================
const dashboardAnalytics = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Query Parameters
        // ==================================================

        const {
            error,
            value
        } = analyticsValidation.validate(

            req.query,

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
        // Get Complete Analytics
        // ==================================================

        const analytics =
            await getDashboardAnalytics({

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                date:
                    value.date,

                startDate:
                    value.startDate,

                endDate:
                    value.endDate,

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

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                filters: {

                    date:
                        value.date,

                    startDate:
                        value.startDate,

                    endDate:
                        value.endDate

                },

                analytics

            }

        });

    } catch (error) {

        next(error);

    }

};

// ==========================================================
// GET TRANSACTION TREND
// ==========================================================
const transactionTrend = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Query Parameters
        // ==================================================

        const {
            error,
            value
        } = analyticsValidation.validate(
            req.query,
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
        // Build Date Range
        // ==================================================

        const range =
            buildDateRange({

                date:
                    value.date,

                startDate:
                    value.startDate,

                endDate:
                    value.endDate

            });


        // ==================================================
        // Get Transaction Trend
        // ==================================================

        const trend =
            await getTransactionTrend({

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Transaction trend fetched successfully.",

            data: {

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

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
// ==========================================================
const revenueTrend = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Query Parameters
        // ==================================================

        const {
            error,
            value
        } = analyticsValidation.validate(
            req.query,
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
        // Build Date Range
        // ==================================================

        const range =
            buildDateRange({

                date:
                    value.date,

                startDate:
                    value.startDate,

                endDate:
                    value.endDate

            });


        // ==================================================
        // Get Revenue Trend
        // ==================================================

        const revenue =
            await getRevenueTrend({

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Revenue trend fetched successfully.",

            data: {

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

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
// ==========================================================
const paymentMethodDistribution = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Query Parameters
        // ==================================================

        const {
            error,
            value
        } = analyticsValidation.validate(
            req.query,
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
        // Build Date Range
        // ==================================================

        const range =
            buildDateRange({

                date:
                    value.date,

                startDate:
                    value.startDate,

                endDate:
                    value.endDate

            });


        // ==================================================
        // Get Payment Method Distribution
        // ==================================================

        const paymentMethods =
            await getPaymentMethodDistribution({

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Payment method distribution fetched successfully.",

            data: {

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

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
// ==========================================================
const paymentProviderDistribution = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Query Parameters
        // ==================================================

        const {
            error,
            value
        } = analyticsValidation.validate(
            req.query,
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
        // Build Date Range
        // ==================================================

        const range =
            buildDateRange({

                date:
                    value.date,

                startDate:
                    value.startDate,

                endDate:
                    value.endDate

            });


        // ==================================================
        // Get Payment Provider Distribution
        // ==================================================

        const providers =
            await getPaymentProviderDistribution({

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Payment provider distribution fetched successfully.",

            data: {

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

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
// ==========================================================
const merchantPerformance = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Query Parameters
        // ==================================================

        const {
            error,
            value
        } = analyticsValidation.validate(
            req.query,
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
        // Build Date Range
        // ==================================================

        const range =
            buildDateRange({

                date:
                    value.date,

                startDate:
                    value.startDate,

                endDate:
                    value.endDate

            });


        // ==================================================
        // Get Merchant Performance
        // ==================================================

        const merchants =
            await getMerchantPerformance({

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate,

                limit:
                    value.limit

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Merchant performance fetched successfully.",

            data: {

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

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
// ==========================================================
const hourlyTransactions = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Query Parameters
        // ==================================================

        const {
            error,
            value
        } = analyticsValidation.validate(
            req.query,
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
        // Build Date Range
        // ==================================================

        const range =
            buildDateRange({

                date:
                    value.date,

                startDate:
                    value.startDate,

                endDate:
                    value.endDate

            });


        // ==================================================
        // Get Hourly Transactions
        // ==================================================

        const hourlyData =
            await getHourlyTransactions({

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Hourly transactions fetched successfully.",

            data: {

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

                count:
                    hourlyData.length,

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
// ==========================================================
const currencyAnalytics = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Query Parameters
        // ==================================================

        const {
            error,
            value
        } = analyticsValidation.validate(
            req.query,
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
        // Build Date Range
        // ==================================================

        const range =
            buildDateRange({

                date:
                    value.date,

                startDate:
                    value.startDate,

                endDate:
                    value.endDate

            });


        // ==================================================
        // Get Currency Analytics
        // ==================================================

        const currencies =
            await getCurrencyAnalytics({

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Currency analytics fetched successfully.",

            data: {

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

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
// ==========================================================
const statusAnalytics = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Query Parameters
        // ==================================================

        const {
            error,
            value
        } = analyticsValidation.validate(
            req.query,
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
        // Build Date Range
        // ==================================================

        const range =
            buildDateRange({

                date:
                    value.date,

                startDate:
                    value.startDate,

                endDate:
                    value.endDate

            });


        // ==================================================
        // Get Status Analytics
        // ==================================================

        const statuses =
            await getStatusAnalytics({

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Transaction status analytics fetched successfully.",

            data: {

                type:
                    value.type,

                merchantId:
                    value.merchantId,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

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