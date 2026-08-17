const {
    getCardTransactions,
    getCardSummary,
    getRecentCardTransactions,
    getCardNetworkAnalytics,
    getCardTypeAnalytics,
    getIssuingBankAnalytics,
    getMerchantCardAnalytics,
    getCardCountryAnalytics
} = require("../../../services/admin/card.service");


const {
    cardDashboardValidation,
    cardSummaryValidation,
    recentCardValidation,
    cardNetworkValidation,
    cardTypeValidation,
    issuingBankValidation,
    merchantCardValidation,
    cardCountryValidation
} = require("../../../validations/admin/card.validation");


// ==========================================================
// CARD DASHBOARD
// GET /card
// ==========================================================

const cardDashboard = async (req, res) => {

    try {

        const {
            error,
            value
        } = cardDashboardValidation.validate(
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
            await getCardTransactions(value);


        return res.status(200).json({

            success: true,

            message:
                "Card transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Card Dashboard Error:",
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
// CARD SUMMARY
// GET /card/summary
// ==========================================================

const cardSummary = async (req, res) => {

    try {

        const {
            error,
            value
        } = cardSummaryValidation.validate(
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
            await getCardSummary(value);


        return res.status(200).json({

            success: true,

            message:
                "Card summary fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Card Summary Error:",
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
// RECENT CARD TRANSACTIONS
// GET /card/recent
// ==========================================================

const recentCardTransactions = async (req, res) => {

    try {

        const {
            error,
            value
        } = recentCardValidation.validate(
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
            await getRecentCardTransactions(value);


        return res.status(200).json({

            success: true,

            message:
                "Recent card transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Recent Card Transactions Error:",
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
// CARD NETWORK ANALYTICS
// GET /card/network
// ==========================================================

const cardNetworkAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = cardNetworkValidation.validate(
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
            await getCardNetworkAnalytics(value);


        return res.status(200).json({

            success: true,

            message:
                "Card network analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Card Network Analytics Error:",
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
// CARD TYPE ANALYTICS
// GET /card/type
// ==========================================================

const cardTypeAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = cardTypeValidation.validate(
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
            await getCardTypeAnalytics(value);


        return res.status(200).json({

            success: true,

            message:
                "Card type analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Card Type Analytics Error:",
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
// ISSUING BANK ANALYTICS
// GET /card/banks
// ==========================================================

const issuingBankAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = issuingBankValidation.validate(
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
            await getIssuingBankAnalytics(value);


        return res.status(200).json({

            success: true,

            message:
                "Issuing bank analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Issuing Bank Analytics Error:",
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
// MERCHANT CARD ANALYTICS
// GET /card/merchant
// ==========================================================

const merchantCardAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = merchantCardValidation.validate(
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
            await getMerchantCardAnalytics(value);


        return res.status(200).json({

            success: true,

            message:
                "Merchant card analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Merchant Card Analytics Error:",
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
// CARD COUNTRY ANALYTICS
// GET /card/country
// ==========================================================

const cardCountryAnalytics = async (req, res) => {

    try {

        const {
            error,
            value
        } = cardCountryValidation.validate(
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
            await getCardCountryAnalytics(value);


        return res.status(200).json({

            success: true,

            message:
                "Card country analytics fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Card Country Analytics Error:",
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

    cardDashboard,
    cardSummary,
    recentCardTransactions,
    cardNetworkAnalytics,
    cardTypeAnalytics,
    issuingBankAnalytics,
    merchantCardAnalytics,
    cardCountryAnalytics

};