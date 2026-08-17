const {
    getNetBankingTransactions,
    getNetBankingSummary,
    getRecentNetBankingTransactions,
    getNetBankBankAnalytics,
    getAccountTypeAnalytics,
    getNetBankingStatusAnalytics,
    getMerchantNetBankingAnalytics,
    getBankCodeAnalytics
} = require("../../../services/admin/netbanking.service");


const {
    netBankingDashboardValidation,
    netBankingSummaryValidation,
    recentNetBankingValidation,
    netBankBankAnalyticsValidation,
    accountTypeValidation,
    netBankingStatusValidation,
    merchantNetBankingValidation,
    bankCodeValidation
} = require("../../../validations/admin/netbanking.validation");


// ==========================================================
// NET BANKING DASHBOARD
// GET /netbanking
// ==========================================================

const netBankingDashboard = async (req, res) => {

    try {

        const {
            error,
            value
        } = netBankingDashboardValidation.validate(
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
            await getNetBankingTransactions(value);


        return res.status(200).json({

            success: true,

            message:
                "Net Banking transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Net Banking Dashboard Error:",
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
// NET BANKING SUMMARY
// GET /netbanking/summary
// ==========================================================

const netBankingSummary = async (req, res) => {

    try {

        const {
            error,
            value
        } = netBankingSummaryValidation.validate(
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
            await getNetBankingSummary(value);


        return res.status(200).json({

            success: true,

            message:
                "Net Banking summary fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Net Banking Summary Error:",
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
// RECENT NET BANKING TRANSACTIONS
// GET /netbanking/recent
// ==========================================================

const recentNetBankingTransactions = async (req, res) => {

    try {

        const {
            error,
            value
        } = recentNetBankingValidation.validate(
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
            await getRecentNetBankingTransactions(value);


        return res.status(200).json({

            success: true,

            message:
                "Recent Net Banking transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Recent Net Banking Transactions Error:",
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
// BANK ANALYTICS
// GET /netbanking/banks
// ==========================================================

const netBankBankAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = netBankBankAnalyticsValidation.validate(
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
            await getNetBankBankAnalytics(value);


        return res.status(200).json({

            success: true,

            message:
                "Net Banking bank analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Net Banking Bank Analytics Error:",
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
// ACCOUNT TYPE ANALYTICS
// GET /netbanking/account-types
// ==========================================================

const accountTypeAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = accountTypeValidation.validate(
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
            await getAccountTypeAnalytics(value);


        return res.status(200).json({

            success: true,

            message:
                "Net Banking account type analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Net Banking Account Type Analytics Error:",
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
// STATUS ANALYTICS
// GET /netbanking/status
// ==========================================================

const netBankingStatusAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = netBankingStatusValidation.validate(
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
            await getNetBankingStatusAnalytics(value);


        return res.status(200).json({

            success: true,

            message:
                "Net Banking status analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Net Banking Status Analytics Error:",
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
// MERCHANT ANALYTICS
// GET /netbanking/merchant
// ==========================================================

const merchantNetBankingAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = merchantNetBankingValidation.validate(
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
            await getMerchantNetBankingAnalytics(value);


        return res.status(200).json({

            success: true,

            message:
                "Merchant Net Banking analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Merchant Net Banking Analytics Error:",
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
// BANK CODE ANALYTICS
// GET /netbanking/bank-codes
// ==========================================================

const bankCodeAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = bankCodeValidation.validate(
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
            await getBankCodeAnalytics(value);


        return res.status(200).json({

            success: true,

            message:
                "Net Banking bank code analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Net Banking Bank Code Analytics Error:",
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

    netBankingDashboard,
    netBankingSummary,
    recentNetBankingTransactions,
    netBankBankAnalytics,
    accountTypeAnalytics,
    netBankingStatusAnalytics,
    merchantNetBankingAnalytics,
    bankCodeAnalytics

};