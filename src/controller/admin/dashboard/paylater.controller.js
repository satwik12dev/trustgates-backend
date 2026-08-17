const {
    getPayLaterTransactions,
    getPayLaterSummary,
    getRecentPayLaterTransactions,
    getProviderAnalytics,
    getDueDateAnalytics,
    getMerchantPayLaterAnalytics,
    getDailyPayLaterAnalytics,
    getUpcomingDuePayments
} = require("../../../services/admin/paylater.service");


const {
    payLaterDashboardValidation,
    payLaterSummaryValidation,
    recentPayLaterValidation,
    providerAnalyticsValidation,
    dueDateAnalyticsValidation,
    merchantPayLaterValidation,
    dailyPayLaterValidation,
    upcomingDuePaymentsValidation
} = require("../../../validations/admin/paylater.validation");


// ==========================================================
// PAY LATER DASHBOARD
// GET /paylater
// ==========================================================

const payLaterDashboard = async (req, res) => {

    try {

        const {
            error,
            value
        } = payLaterDashboardValidation.validate(
            req.query,
            {
                abortEarly: false,
                stripUnknown: true
            }
        );

        if (error) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "VALIDATION_ERROR",
                    message: error.details
                        .map(detail => detail.message)
                        .join(", ")
                }

            });

        }

        const data =
            await getPayLaterTransactions(value);

        return res.status(200).json({

            success: true,

            message:
                "Pay Later transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Pay Later Dashboard Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: error.message
            }

        });

    }

};


// ==========================================================
// PAY LATER SUMMARY
// GET /paylater/summary
// ==========================================================

const payLaterSummary = async (req, res) => {

    try {

        const {
            error,
            value
        } = payLaterSummaryValidation.validate(
            req.query,
            {
                abortEarly: false,
                stripUnknown: true
            }
        );

        if (error) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "VALIDATION_ERROR",
                    message: error.details
                        .map(detail => detail.message)
                        .join(", ")
                }

            });

        }

        const data =
            await getPayLaterSummary(value);

        return res.status(200).json({

            success: true,

            message:
                "Pay Later summary fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Pay Later Summary Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: error.message
            }

        });

    }

};


// ==========================================================
// RECENT PAY LATER
// GET /paylater/recent
// ==========================================================

const recentPayLaterTransactions = async (req, res) => {

    try {

        const {
            error,
            value
        } = recentPayLaterValidation.validate(
            req.query,
            {
                abortEarly: false,
                stripUnknown: true
            }
        );

        if (error) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "VALIDATION_ERROR",
                    message: error.details
                        .map(detail => detail.message)
                        .join(", ")
                        .replace(/"/g, "")
                }

            });

        }

        const data =
            await getRecentPayLaterTransactions(value);

        return res.status(200).json({

            success: true,

            message:
                "Recent Pay Later transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Recent Pay Later Transactions Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: error.message
            }

        });

    }

};


// ==========================================================
// PROVIDER ANALYTICS
// GET /paylater/providers
// ==========================================================

const providerAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = providerAnalyticsValidation.validate(
            req.query,
            {
                abortEarly: false,
                stripUnknown: true
            }
        );

        if (error) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "VALIDATION_ERROR",
                    message: error.details
                        .map(detail => detail.message)
                        .join(", ")
                }

            });

        }

        const data =
            await getProviderAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "Pay Later provider analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Pay Later Provider Analytics Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: error.message
            }

        });

    }

};


// ==========================================================
// DUE DATE ANALYTICS
// GET /paylater/due-dates
// ==========================================================

const dueDateAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = dueDateAnalyticsValidation.validate(
            req.query,
            {
                abortEarly: false,
                stripUnknown: true
            }
        );

        if (error) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "VALIDATION_ERROR",
                    message: error.details
                        .map(detail => detail.message)
                        .join(", ")
                }

            });

        }

        const data =
            await getDueDateAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "Pay Later due-date analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Pay Later Due Date Analytics Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: error.message
            }

        });

    }

};


// ==========================================================
// MERCHANT PAY LATER ANALYTICS
// GET /paylater/merchant
// ==========================================================

const merchantPayLaterAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = merchantPayLaterValidation.validate(
            req.query,
            {
                abortEarly: false,
                stripUnknown: true
            }
        );

        if (error) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "VALIDATION_ERROR",
                    message: error.details
                        .map(detail => detail.message)
                        .join(", ")
                }

            });

        }

        const data =
            await getMerchantPayLaterAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "Merchant Pay Later analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Merchant Pay Later Analytics Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: error.message
            }

        });

    }

};


// ==========================================================
// DAILY PAY LATER ANALYTICS
// GET /paylater/daily
// ==========================================================

const dailyPayLaterAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = dailyPayLaterValidation.validate(
            req.query,
            {
                abortEarly: false,
                stripUnknown: true
            }
        );

        if (error) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "VALIDATION_ERROR",
                    message: error.details
                        .map(detail => detail.message)
                        .join(", ")
                }

            });

        }

        const data =
            await getDailyPayLaterAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "Daily Pay Later analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Daily Pay Later Analytics Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: error.message
            }

        });

    }

};


// ==========================================================
// UPCOMING DUE PAYMENTS
// GET /paylater/upcoming-due
// ==========================================================

const upcomingDuePayments = async (req, res) => {

    try {

        const {
            error,
            value
        } = upcomingDuePaymentsValidation.validate(
            req.query,
            {
                abortEarly: false,
                stripUnknown: true
            }
        );

        if (error) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "VALIDATION_ERROR",
                    message: error.details
                        .map(detail => detail.message)
                        .join(", ")
                }

            });

        }

        const data =
            await getUpcomingDuePayments(value);

        return res.status(200).json({

            success: true,

            message:
                "Upcoming Pay Later due payments fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Upcoming Pay Later Due Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: error.message
            }

        });

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    payLaterDashboard,

    payLaterSummary,

    recentPayLaterTransactions,

    providerAnalytics,

    dueDateAnalytics,

    merchantPayLaterAnalytics,

    dailyPayLaterAnalytics,

    upcomingDuePayments

};