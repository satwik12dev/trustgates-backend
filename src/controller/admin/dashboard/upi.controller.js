const {
    getUpiTransactions,
    getUpiSummary,
    getRecentUpiTransactions,
    getUpiAnalytics,
    getBankAnalytics,
    getMerchantUpiAnalytics,
    getUpiVerificationAnalytics
} = require("../../../services/admin/upi.service");

const {
    upiDashboardValidation,
    upiSummaryValidation,
    recentUpiValidation,
    upiAnalyticsValidation,
    bankAnalyticsValidation,
    merchantUpiValidation,
    upiVerificationValidation
} = require("../../../validations/admin/upi.validation");


// ==========================================================
// UPI DASHBOARD
// ==========================================================

const upiDashboard = async (req, res) => {

    try {

        const {
            error,
            value
        } = upiDashboardValidation.validate(
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
            await getUpiTransactions(value);

        return res.status(200).json({

            success: true,

            message:
                "UPI transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "UPI Dashboard Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {

                code:
                    "INTERNAL_SERVER_ERROR",

                message:
                    error.message

            }

        });

    }

};


// ==========================================================
// UPI SUMMARY
// ==========================================================

const upiSummary = async (req, res) => {

    try {

        const {
            error,
            value
        } = upiSummaryValidation.validate(
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
            await getUpiSummary(value);

        return res.status(200).json({

            success: true,

            message:
                "UPI summary fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "UPI Summary Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {

                code:
                    "INTERNAL_SERVER_ERROR",

                message:
                    error.message

            }

        });

    }

};


// ==========================================================
// RECENT UPI TRANSACTIONS
// ==========================================================

const recentUpiTransactions = async (req, res) => {

    try {

        const {
            error,
            value
        } = recentUpiValidation.validate(
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
            await getRecentUpiTransactions(value);

        return res.status(200).json({

            success: true,

            message:
                "Recent UPI transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Recent UPI Transactions Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {

                code:
                    "INTERNAL_SERVER_ERROR",

                message:
                    error.message

            }

        });

    }

};


// ==========================================================
// UPI ANALYTICS
// ==========================================================

const upiAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = upiAnalyticsValidation.validate(
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
            await getUpiAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "UPI analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "UPI Analytics Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {

                code:
                    "INTERNAL_SERVER_ERROR",

                message:
                    error.message

            }

        });

    }

};


// ==========================================================
// BANK ANALYTICS
// ==========================================================

const bankAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = bankAnalyticsValidation.validate(
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
            await getBankAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "UPI bank analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "UPI Bank Analytics Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {

                code:
                    "INTERNAL_SERVER_ERROR",

                message:
                    error.message

            }

        });

    }

};


// ==========================================================
// MERCHANT UPI ANALYTICS
// ==========================================================

const merchantUpiAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = merchantUpiValidation.validate(
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
            await getMerchantUpiAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "Merchant UPI analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Merchant UPI Analytics Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {

                code:
                    "INTERNAL_SERVER_ERROR",

                message:
                    error.message

            }

        });

    }

};


// ==========================================================
// UPI VERIFICATION ANALYTICS
// ==========================================================

const upiVerificationAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = upiVerificationValidation.validate(
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
            await getUpiVerificationAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "UPI verification analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "UPI Verification Analytics Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {

                code:
                    "INTERNAL_SERVER_ERROR",

                message:
                    error.message

            }

        });

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    upiDashboard,
    upiSummary,
    recentUpiTransactions,
    upiAnalytics,
    bankAnalytics,
    merchantUpiAnalytics,
    upiVerificationAnalytics

};