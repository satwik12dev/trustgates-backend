const {
    getWalletTransactions,
    getWalletSummary,
    getRecentWalletTransactions,
    getWalletAnalytics,
    getWalletStatusAnalytics,
    getTopWallets
} = require("../../../services/admin/wallet.service");


// ==========================================================
// HELPER
// ==========================================================

const getDateRange = (startDate, endDate) => {

    return {

        startDate:
            startDate || "1970-01-01 00:00:00",

        endDate:
            endDate || "2999-12-31 23:59:59"

    };

};


// ==========================================================
// WALLET DASHBOARD
// GET /wallet
// ==========================================================

const walletDashboard = async (req, res) => {

    try {

        const {

            merchantId = null,

            status = null,

            walletName = null,

            startDate = null,

            endDate = null,

            search = null,

            page = 1,

            limit = 20

        } = req.query;


        // ----------------------------------------------
        // Date validation
        // ----------------------------------------------

        if (
            (startDate && !endDate) ||
            (!startDate && endDate)
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "startDate and endDate must be provided together."

                }

            });

        }


        if (
            startDate &&
            endDate &&
            new Date(startDate) >=
            new Date(endDate)
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "startDate must be earlier than endDate."

                }

            });

        }


        const data =
            await getWalletTransactions({

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                status:
                    status || null,

                walletName:
                    walletName || null,

                startDate:
                    startDate || null,

                endDate:
                    endDate || null,

                search:
                    search || null,

                page:
                    Number(page) || 1,

                limit:
                    Number(limit) || 20

            });


        return res.status(200).json({

            success: true,

            message:
                "Wallet transactions fetched successfully.",

            data: {

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                filters: {

                    startDate:
                        startDate || null,

                    endDate:
                        endDate || null,

                    status:
                        status || null,

                    walletName:
                        walletName || null,

                    search:
                        search || null

                },

                ...data

            }

        });

    } catch (error) {

        console.error(
            "Wallet Dashboard Error:",
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
// WALLET SUMMARY
// GET /wallet/summary
// ==========================================================

const walletSummary = async (req, res) => {

    try {

        const {

            merchantId = null,

            startDate = null,

            endDate = null

        } = req.query;


        if (
            (startDate && !endDate) ||
            (!startDate && endDate)
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "startDate and endDate must be provided together."

                }

            });

        }


        if (
            startDate &&
            endDate &&
            new Date(startDate) >=
            new Date(endDate)
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "startDate must be earlier than endDate."

                }

            });

        }


        const range =
            getDateRange(
                startDate,
                endDate
            );


        const summary =
            await getWalletSummary({

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate

            });


        return res.status(200).json({

            success: true,

            message:
                "Wallet summary fetched successfully.",

            data: {

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                filters: {

                    startDate:
                        startDate || null,

                    endDate:
                        endDate || null

                },

                summary

            }

        });

    } catch (error) {

        console.error(
            "Wallet Summary Error:",
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
// RECENT WALLET TRANSACTIONS
// GET /wallet/recent
// ==========================================================

const recentWalletTransactions = async (req, res) => {

    try {

        const {

            merchantId = null,

            limit = 10

        } = req.query;


        const data =
            await getRecentWalletTransactions({

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                limit:
                    Number(limit) || 10

            });


        return res.status(200).json({

            success: true,

            message:
                "Recent wallet transactions fetched successfully.",

            data: {

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                ...data

            }

        });

    } catch (error) {

        console.error(
            "Recent Wallet Transactions Error:",
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
// WALLET ANALYTICS
// GET /wallet/analytics
// ==========================================================

const walletAnalytics = async (req, res) => {

    try {

        const {

            merchantId = null,

            startDate = null,

            endDate = null

        } = req.query;


        if (
            (startDate && !endDate) ||
            (!startDate && endDate)
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "startDate and endDate must be provided together."

                }

            });

        }


        if (
            startDate &&
            endDate &&
            new Date(startDate) >=
            new Date(endDate)
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "startDate must be earlier than endDate."

                }

            });

        }


        const range =
            getDateRange(
                startDate,
                endDate
            );


        const analytics =
            await getWalletAnalytics({

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate

            });


        return res.status(200).json({

            success: true,

            message:
                "Wallet analytics fetched successfully.",

            data: {

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                filters: {

                    startDate:
                        startDate || null,

                    endDate:
                        endDate || null

                },

                analytics

            }

        });

    } catch (error) {

        console.error(
            "Wallet Analytics Error:",
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
// WALLET STATUS ANALYTICS
// GET /wallet/status
// ==========================================================

const walletStatusAnalytics = async (req, res) => {

    try {

        const {

            merchantId = null,

            startDate = null,

            endDate = null

        } = req.query;


        if (
            (startDate && !endDate) ||
            (!startDate && endDate)
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "startDate and endDate must be provided together."

                }

            });

        }


        if (
            startDate &&
            endDate &&
            new Date(startDate) >=
            new Date(endDate)
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "startDate must be earlier than endDate."

                }

            });

        }


        const range =
            getDateRange(
                startDate,
                endDate
            );


        const statuses =
            await getWalletStatusAnalytics({

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate

            });


        return res.status(200).json({

            success: true,

            message:
                "Wallet status analytics fetched successfully.",

            data: {

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                filters: {

                    startDate:
                        startDate || null,

                    endDate:
                        endDate || null

                },

                statuses

            }

        });

    } catch (error) {

        console.error(
            "Wallet Status Analytics Error:",
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
// TOP WALLETS
// GET /wallet/top
// ==========================================================

const topWallets = async (req, res) => {

    try {

        const {

            merchantId = null,

            startDate = null,

            endDate = null

        } = req.query;


        if (
            (startDate && !endDate) ||
            (!startDate && endDate)
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "startDate and endDate must be provided together."

                }

            });

        }


        if (
            startDate &&
            endDate &&
            new Date(startDate) >=
            new Date(endDate)
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "startDate must be earlier than endDate."

                }

            });

        }


        const range =
            getDateRange(
                startDate,
                endDate
            );


        const wallets =
            await getTopWallets({

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate

            });


        return res.status(200).json({

            success: true,

            message:
                "Top wallets fetched successfully.",

            data: {

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                filters: {

                    startDate:
                        startDate || null,

                    endDate:
                        endDate || null

                },

                count:
                    wallets.length,

                wallets

            }

        });

    } catch (error) {

        console.error(
            "Top Wallets Error:",
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

    walletDashboard,

    walletSummary,

    recentWalletTransactions,

    walletAnalytics,

    walletStatusAnalytics,

    topWallets

};