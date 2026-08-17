const {
    getEmiTransactions,
    getEmiSummary,
    getRecentEmiTransactions,
    getEmiBankAnalytics,
    getEmiCardNetworkAnalytics,
    getEmiTenureAnalytics,
    getMerchantEmiAnalytics,
    getInterestRateAnalytics
} = require("../../../services/admin/emi.service");


const {
    emiDashboardValidation,
    emiSummaryValidation,
    recentEmiValidation,
    emiBankAnalyticsValidation,
    emiCardNetworkValidation,
    emiTenureValidation,
    merchantEmiValidation,
    interestRateValidation
} = require("../../../validations/admin/emi.validation");


// ==========================================================
// EMI DASHBOARD
// GET /emi
// ==========================================================

const emiDashboard = async (req, res) => {

    try {

        const {
            error,
            value
        } = emiDashboardValidation.validate(
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
            await getEmiTransactions(value);

        return res.status(200).json({

            success: true,

            message:
                "EMI transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "EMI Dashboard Error:",
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
// EMI SUMMARY
// GET /emi/summary
// ==========================================================

const emiSummary = async (req, res) => {

    try {

        const {
            error,
            value
        } = emiSummaryValidation.validate(
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
            await getEmiSummary(value);

        return res.status(200).json({

            success: true,

            message:
                "EMI summary fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "EMI Summary Error:",
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
// RECENT EMI
// GET /emi/recent
// ==========================================================

const recentEmiTransactions = async (req, res) => {

    try {

        const {
            error,
            value
        } = recentEmiValidation.validate(
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
            await getRecentEmiTransactions(value);

        return res.status(200).json({

            success: true,

            message:
                "Recent EMI transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Recent EMI Transactions Error:",
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
// EMI BANK / ISSUER ANALYTICS
// GET /emi/banks
// ==========================================================

const emiBankAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = emiBankAnalyticsValidation.validate(
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
            await getEmiBankAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "EMI bank analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "EMI Bank Analytics Error:",
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
// EMI CARD NETWORK
// GET /emi/card-networks
// ==========================================================

const emiCardNetworkAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = emiCardNetworkValidation.validate(
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
            await getEmiCardNetworkAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "EMI card network analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "EMI Card Network Analytics Error:",
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
// EMI TENURE
// GET /emi/tenures
// ==========================================================

const emiTenureAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = emiTenureValidation.validate(
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
            await getEmiTenureAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "EMI tenure analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "EMI Tenure Analytics Error:",
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
// MERCHANT EMI
// GET /emi/merchant
// ==========================================================

const merchantEmiAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = merchantEmiValidation.validate(
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
            await getMerchantEmiAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "Merchant EMI analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Merchant EMI Analytics Error:",
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
// INTEREST RATE
// GET /emi/interest-rates
// ==========================================================

const interestRateAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = interestRateValidation.validate(
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
            await getInterestRateAnalytics(value);

        return res.status(200).json({

            success: true,

            message:
                "EMI interest-rate analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "EMI Interest Rate Analytics Error:",
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

    emiDashboard,
    emiSummary,
    recentEmiTransactions,
    emiBankAnalytics,
    emiCardNetworkAnalytics,
    emiTenureAnalytics,
    merchantEmiAnalytics,
    interestRateAnalytics

};