const {
    getRefunds,
    getRefundSummary,
    getRecentRefunds,
    getRefundAnalytics,
    getMerchantRefundAnalytics,
    getRefundStatusAnalytics
} = require("../../../services/admin/refund.service");


// ==========================================================
// GET /refunds
// ==========================================================

const refundDashboard = async (req, res) => {

    try {

        const {
            merchantId = null,
            refundStatus = null,
            refundType = null,
            startDate = null,
            endDate = null,
            search = null,
            page = 1,
            limit = 20
        } = req.query;


        // Both dates must be provided together
        if (
            (startDate && !endDate) ||
            (!startDate && endDate)
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code: "VALIDATION_ERROR",

                    message:
                        "startDate and endDate must be provided together."

                }

            });

        }


        const data =
            await getRefunds({

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                refundStatus,

                refundType,

                startDate,

                endDate,

                search,

                page:
                    Number(page) || 1,

                limit:
                    Number(limit) || 20

            });


        return res.status(200).json({

            success: true,

            message:
                "Refunds fetched successfully.",

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

                    refundStatus:
                        refundStatus || null,

                    refundType:
                        refundType || null,

                    search:
                        search || null

                },

                ...data

            }

        });

    } catch (error) {

        console.error(
            "Refund Dashboard Error:",
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
// GET /refunds/summary
// ==========================================================

const refundSummary = async (req, res) => {

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

                    code: "VALIDATION_ERROR",

                    message:
                        "startDate and endDate must be provided together."

                }

            });

        }


        const data =
            await getRefundSummary({

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                // null means all-time
                startDate:
                    startDate || "1970-01-01 00:00:00",

                endDate:
                    endDate || "2999-12-31 23:59:59"

            });


        return res.status(200).json({

            success: true,

            message:
                "Refund summary fetched successfully.",

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

                summary:
                    data

            }

        });

    } catch (error) {

        console.error(
            "Refund Summary Error:",
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
// GET /refunds/recent
// ==========================================================

const recentRefunds = async (req, res) => {

    try {

        const {
            merchantId = null,
            limit = 10
        } = req.query;


        const data =
            await getRecentRefunds({

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
                "Recent refunds fetched successfully.",

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
            "Recent Refunds Error:",
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
// GET /refunds/analytics
// ==========================================================

const refundAnalytics = async (req, res) => {

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

                    code: "VALIDATION_ERROR",

                    message:
                        "startDate and endDate must be provided together."

                }

            });

        }


        const data =
            await getRefundAnalytics({

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                startDate:
                    startDate || "1970-01-01 00:00:00",

                endDate:
                    endDate || "2999-12-31 23:59:59"

            });


        return res.status(200).json({

            success: true,

            message:
                "Refund analytics fetched successfully.",

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

                analytics:
                    data

            }

        });

    } catch (error) {

        console.error(
            "Refund Analytics Error:",
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
// GET /refunds/merchant
// ==========================================================

const merchantRefundAnalytics = async (req, res) => {

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

                    code: "VALIDATION_ERROR",

                    message:
                        "startDate and endDate must be provided together."

                }

            });

        }


        const data =
            await getMerchantRefundAnalytics({

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                startDate:
                    startDate || "1970-01-01 00:00:00",

                endDate:
                    endDate || "2999-12-31 23:59:59"

            });


        return res.status(200).json({

            success: true,

            message:
                "Merchant refund analytics fetched successfully.",

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

                merchants:
                    data

            }

        });

    } catch (error) {

        console.error(
            "Merchant Refund Analytics Error:",
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
// GET /refunds/status
// ==========================================================

const refundStatusAnalytics = async (req, res) => {

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

                    code: "VALIDATION_ERROR",

                    message:
                        "startDate and endDate must be provided together."

                }

            });

        }


        const data =
            await getRefundStatusAnalytics({

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                startDate:
                    startDate || "1970-01-01 00:00:00",

                endDate:
                    endDate || "2999-12-31 23:59:59"

            });


        return res.status(200).json({

            success: true,

            message:
                "Refund status analytics fetched successfully.",

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

                statuses:
                    data

            }

        });

    } catch (error) {

        console.error(
            "Refund Status Analytics Error:",
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

    refundDashboard,

    refundSummary,

    recentRefunds,

    refundAnalytics,

    merchantRefundAnalytics,

    refundStatusAnalytics

};