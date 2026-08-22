const Joi = require("joi");

const {
    getAdminDashboard,
    buildDateRange,
    getDashboardSummary,
    getRecentTransactions,
    getTransactionVolume,
    getSuccessRate,
    getPaymentMethodAnalytics,
    getTransactionStatusAnalytics,
    getTopMerchants,
    getTransactions,
    getLatestTransactions,
    getTransactionDashboard,
    getTransactionById
} = require(
    "../../../services/admin/dashboard.service"
);


// ==========================================================
// DASHBOARD VALIDATION
// ==========================================================

const dashboardValidation = Joi.object({

    // ======================================================
    // PAYMENT TYPE
    // Optional for main dashboard
    // ======================================================

    paymentType: Joi.string()
        .valid("PAYIN", "PAYOUT")
        .allow(null, "")
        .default(null),

    merchantId: Joi.number()
        .integer()
        .positive()
        .allow(null, "")
        .default(null),

    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow(null, "")
        .default(null),

    startDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow(null, "")
        .default(null),

    endDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow(null, "")
        .default(null),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(10)

})
.custom((value, helpers) => {

    const {
        date,
        startDate,
        endDate
    } = value;


    // ======================================================
    // DATE + RANGE NOT ALLOWED TOGETHER
    // ======================================================

    if (
        date &&
        (
            startDate ||
            endDate
        )
    ) {

        return helpers.error(
            "dashboard.dateRangeConflict"
        );

    }


    // ======================================================
    // BOTH RANGE VALUES REQUIRED
    // ======================================================

    if (
        startDate &&
        !endDate
    ) {

        return helpers.error(
            "dashboard.incompleteRange"
        );

    }


    if (
        !startDate &&
        endDate
    ) {

        return helpers.error(
            "dashboard.incompleteRange"
        );

    }


    // ======================================================
    // START DATE < END DATE
    // ======================================================

    if (
        startDate &&
        endDate &&
        startDate >= endDate
    ) {

        return helpers.error(
            "dashboard.invalidRange"
        );

    }


    return value;

})
.messages({

    "dashboard.dateRangeConflict":
        "Use either date or startDate and endDate, not both.",

    "dashboard.incompleteRange":
        "Both startDate and endDate are required.",

    "dashboard.invalidRange":
        "Start date must be before end date."

});


// ==========================================================
// GET ADMIN DASHBOARD
// GET /admin/dashboard
// ==========================================================

const dashboardOverview = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate
        // ==================================================

        const {
            error,
            value
        } =
            dashboardValidation.validate(
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
        // Dashboard Service
        // ==================================================

        const dashboard =
            await getAdminDashboard({

                paymentType:
                    value.paymentType,

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
                "Admin dashboard fetched successfully.",

            data:
                dashboard

        });

    } catch (error) {

        console.error(
            "Admin Dashboard Error:",
            error
        );

        next(error);

    }

};


// ==========================================================
// GET DASHBOARD SUMMARY
// ==========================================================

const summaryCards = async (
    req,
    res,
    next
) => {

    try {

        const {
            type,
            merchantId,
            date,
            startDate,
            endDate
        } = req.query;


        // ==================================================
        // Basic Validation
        // ==================================================

        if (
            !type ||
            !["PAYIN", "PAYOUT"].includes(
                type.toUpperCase()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "type must be either PAYIN or PAYOUT."

            });

        }


        // ==================================================
        // Build Date Range
        // ==================================================

        const range =
            buildDateRange({

                date,

                startDate,

                endDate

            });


        // ==================================================
        // Service
        // ==================================================

        const summary =
            await getDashboardSummary({

                type:
                    type.toUpperCase(),

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

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
                "Dashboard summary fetched successfully.",

            data: {

                type:
                    type.toUpperCase(),

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

                summary

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET RECENT TRANSACTIONS
// ==========================================================

const recentTransactions = async (
    req,
    res,
    next
) => {

    try {

        const {
            type,
            merchantId,
            date,
            startDate,
            endDate
        } = req.query;


        // ==================================================
        // Validate Payment Type
        // ==================================================

        if (
            !type ||
            ![
                "PAYIN",
                "PAYOUT"
            ].includes(
                type.toUpperCase()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "type must be either PAYIN or PAYOUT."

            });

        }


        // ==================================================
        // Merchant ID
        // ==================================================

        let parsedMerchantId =
            null;


        if (
            merchantId !== undefined &&
            merchantId !== null &&
            merchantId !== ""
        ) {

            parsedMerchantId =
                Number(
                    merchantId
                );


            if (
                !Number.isInteger(
                    parsedMerchantId
                ) ||
                parsedMerchantId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Merchant ID must be a valid positive integer."

                });

            }

        }


        // ==================================================
        // Build Date Range
        // ==================================================

        const range =
            buildDateRange({

                date,

                startDate,

                endDate

            });


        // ==================================================
        // Get Recent Transactions
        // ==================================================

        const transactions =
            await getRecentTransactions({

                type:
                    type.toUpperCase(),

                merchantId:
                    parsedMerchantId,

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
                "Recent transactions fetched successfully.",

            data: {

                type:
                    type.toUpperCase(),

                merchantId:
                    parsedMerchantId,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

                count:
                    transactions.length,

                transactions

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET TRANSACTION VOLUME
// ==========================================================

const transactionVolume = async (
    req,
    res,
    next
) => {

    try {

        const {
            type,
            merchantId,
            date,
            startDate,
            endDate
        } = req.query;


        // ==================================================
        // Validate Type
        // ==================================================

        if (
            !type ||
            ![
                "PAYIN",
                "PAYOUT"
            ].includes(
                type.toUpperCase()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "type must be either PAYIN or PAYOUT."

            });

        }


        // ==================================================
        // Validate Merchant ID
        // ==================================================

        let parsedMerchantId = null;


        if (
            merchantId !== undefined &&
            merchantId !== null &&
            merchantId !== ""
        ) {

            parsedMerchantId =
                Number(
                    merchantId
                );


            if (
                !Number.isInteger(
                    parsedMerchantId
                ) ||
                parsedMerchantId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Merchant ID must be a valid positive integer."

                });

            }

        }


        // ==================================================
        // Build Date Range
        // ==================================================

        const range =
            buildDateRange({

                date,

                startDate,

                endDate

            });


        // ==================================================
        // Get Transaction Volume
        // ==================================================

        const volume =
            await getTransactionVolume({

                type:
                    type.toUpperCase(),

                merchantId:
                    parsedMerchantId,

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
                "Transaction volume fetched successfully.",

            data: {

                type:
                    type.toUpperCase(),

                merchantId:
                    parsedMerchantId,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

                count:
                    volume.length,

                volume

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET SUCCESS RATE
// ==========================================================

const successRate = async (
    req,
    res,
    next
) => {

    try {

        const {
            type,
            merchantId,
            date,
            startDate,
            endDate
        } = req.query;


        // ==================================================
        // Validate Type
        // ==================================================

        if (
            !type ||
            ![
                "PAYIN",
                "PAYOUT"
            ].includes(
                type.toUpperCase()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "type must be either PAYIN or PAYOUT."

            });

        }


        // ==================================================
        // Merchant ID
        // ==================================================

        let parsedMerchantId =
            null;


        if (
            merchantId !== undefined &&
            merchantId !== null &&
            merchantId !== ""
        ) {

            parsedMerchantId =
                Number(
                    merchantId
                );


            if (
                !Number.isInteger(
                    parsedMerchantId
                ) ||
                parsedMerchantId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Merchant ID must be a valid positive integer."

                });

            }

        }


        // ==================================================
        // Date Range
        // ==================================================

        const range =
            buildDateRange({

                date,

                startDate,

                endDate

            });


        // ==================================================
        // Get Success Rate
        // ==================================================

        const result =
            await getSuccessRate({

                type:
                    type.toUpperCase(),

                merchantId:
                    parsedMerchantId,

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
                "Transaction success rate fetched successfully.",

            data: {

                type:
                    type.toUpperCase(),

                merchantId:
                    parsedMerchantId,

                filters: {

                    startDate:
                        range.startDate,

                    endDate:
                        range.endDate

                },

                ...result

            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET PAYMENT METHOD ANALYTICS
// ==========================================================

const paymentMethodAnalytics = async (
    req,
    res,
    next
) => {

    try {

        const {
            type,
            merchantId,
            date,
            startDate,
            endDate
        } = req.query;


        // ==================================================
        // Validate Type
        // ==================================================

        if (
            !type ||
            ![
                "PAYIN",
                "PAYOUT"
            ].includes(
                type.toUpperCase()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "type must be either PAYIN or PAYOUT."

            });

        }


        // ==================================================
        // Merchant ID
        // ==================================================

        let parsedMerchantId = null;


        if (
            merchantId !== undefined &&
            merchantId !== null &&
            merchantId !== ""
        ) {

            parsedMerchantId =
                Number(
                    merchantId
                );


            if (
                !Number.isInteger(
                    parsedMerchantId
                ) ||
                parsedMerchantId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Merchant ID must be a valid positive integer."

                });

            }

        }


        // ==================================================
        // Date Range
        // ==================================================

        const range =
            buildDateRange({

                date,

                startDate,

                endDate

            });


        // ==================================================
        // Get Analytics
        // ==================================================

        const paymentMethods =
            await getPaymentMethodAnalytics({

                type:
                    type.toUpperCase(),

                merchantId:
                    parsedMerchantId,

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
                "Payment method analytics fetched successfully.",

            data: {

                type:
                    type.toUpperCase(),

                merchantId:
                    parsedMerchantId,

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
// GET TRANSACTION STATUS ANALYTICS
// ==========================================================

const transactionStatusAnalytics = async (
    req,
    res,
    next
) => {

    try {

        const {
            type,
            merchantId,
            date,
            startDate,
            endDate
        } = req.query;


        // ==================================================
        // Validate Type
        // ==================================================

        if (
            !type ||
            ![
                "PAYIN",
                "PAYOUT"
            ].includes(
                type.toUpperCase()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "type must be either PAYIN or PAYOUT."

            });

        }


        // ==================================================
        // Merchant ID
        // ==================================================

        let parsedMerchantId = null;


        if (
            merchantId !== undefined &&
            merchantId !== null &&
            merchantId !== ""
        ) {

            parsedMerchantId =
                Number(
                    merchantId
                );


            if (
                !Number.isInteger(
                    parsedMerchantId
                ) ||
                parsedMerchantId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Merchant ID must be a valid positive integer."

                });

            }

        }


        // ==================================================
        // Date Range
        // ==================================================

        const range =
            buildDateRange({

                date,

                startDate,

                endDate

            });


        // ==================================================
        // Get Status Analytics
        // ==================================================

        const statuses =
            await getTransactionStatusAnalytics({

                type:
                    type.toUpperCase(),

                merchantId:
                    parsedMerchantId,

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
                    type.toUpperCase(),

                merchantId:
                    parsedMerchantId,

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
// GET TOP MERCHANTS
// ==========================================================

const topMerchants = async (
    req,
    res,
    next
) => {

    try {

        const {
            paymentType,
            merchantId,
            date,
            startDate,
            endDate,
            limit
        } = req.query;


        // ==================================================
        // Payment Type
        // ==================================================

        const normalizedPaymentType =
            String(
                paymentType || "PAYIN"
            )
                .trim()
                .toUpperCase();


        if (
            ![
                "PAYIN",
                "PAYOUT"
            ].includes(
                normalizedPaymentType
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment type must be PAYIN or PAYOUT."

            });

        }


        // ==================================================
        // Merchant ID
        // ==================================================

        let parsedMerchantId =
            null;


        if (
            merchantId !== undefined &&
            merchantId !== null &&
            merchantId !== ""
        ) {

            parsedMerchantId =
                Number(
                    merchantId
                );


            if (
                !Number.isInteger(
                    parsedMerchantId
                ) ||
                parsedMerchantId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Merchant ID must be a valid positive integer."

                });

            }

        }


        // ==================================================
        // Limit
        // ==================================================

        let parsedLimit =
            10;


        if (
            limit !== undefined &&
            limit !== ""
        ) {

            parsedLimit =
                Number(
                    limit
                );


            if (
                !Number.isInteger(
                    parsedLimit
                ) ||
                parsedLimit < 1 ||
                parsedLimit > 100
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Limit must be between 1 and 100."

                });

            }

        }


        // ==================================================
        // Date Range
        // ==================================================

        const range =
            buildDateRange({

                date,

                startDate,

                endDate

            });


        // ==================================================
        // Get Top Merchants
        // ==================================================

        const merchants =
            await getTopMerchants({

                paymentType:
                    normalizedPaymentType,

                merchantId:
                    parsedMerchantId,

                startDate:
                    range.startDate,

                endDate:
                    range.endDate,

                limit:
                    parsedLimit

            });


        // ==================================================
        // Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Top merchants fetched successfully.",

            data: {

                paymentType:
                    normalizedPaymentType,

                merchantId:
                    parsedMerchantId,

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
// GET /transactions
// ==========================================================

const transactionList = async (
    req,
    res
) => {

    try {

        const {
            paymentType = null,
            merchantId = null,
            status = null,
            paymentMethod = null,
            gatewayName = null,
            startDate = null,
            endDate = null,
            search = null,
            page = 1,
            limit = 20
        } = req.query;


        const data =
            await getTransactions({

                paymentType,

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                status,

                paymentMethod,

                gatewayName,

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
                "Transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Transaction List Error:",
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
// GET /transactions/latest
// ==========================================================

const latestTransactions = async (
    req,
    res
) => {

    try {

        const {
            paymentType = null,
            merchantId = null,
            limit = 10
        } = req.query;


        const data =
            await getLatestTransactions({

                paymentType,

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
                "Latest transactions fetched successfully.",

            data

        });

    } catch (error) {

        console.error(
            "Latest Transactions Error:",
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
// GET /transactions/dashboard
// ==========================================================

const dashboardTransactions = async (
    req,
    res
) => {

    try {

        const {
            paymentType = null,
            merchantId = null,
            startDate,
            endDate
        } = req.query;


        if (
            !startDate ||
            !endDate
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "startDate and endDate are required."

                }

            });

        }


        const data =
            await getTransactionDashboard({

                paymentType,

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                startDate,

                endDate

            });


        return res.status(200).json({

            success: true,

            message:
                "Transaction dashboard fetched successfully.",

            data: {

                type:
                    paymentType,

                merchantId:
                    merchantId
                        ? Number(merchantId)
                        : null,

                filters: {

                    startDate,

                    endDate

                },

                summary:
                    data

            }

        });

    } catch (error) {

        console.error(
            "Transaction Dashboard Error:",
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
// GET /transactions/:transactionId
// ==========================================================

const transactionDetails = async (
    req,
    res
) => {

    try {

        const {
            transactionId
        } = req.params;


        if (
            !transactionId ||
            !/^\d+$/.test(
                transactionId
            )
        ) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "VALIDATION_ERROR",

                    message:
                        "Valid transactionId is required."

                }

            });

        }


        const transaction =
            await getTransactionById(
                Number(
                    transactionId
                )
            );


        if (!transaction) {

            return res.status(404).json({

                success: false,

                error: {

                    code:
                        "TRANSACTION_NOT_FOUND",

                    message:
                        "Transaction not found."

                }

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Transaction details fetched successfully.",

            data:
                transaction

        });

    } catch (error) {

        console.error(
            "Transaction Details Error:",
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

    dashboardOverview,

    summaryCards,

    recentTransactions,

    transactionVolume,

    successRate,

    paymentMethodAnalytics,

    transactionStatusAnalytics,

    topMerchants,

    transactionList,

    latestTransactions,

    dashboardTransactions,

    transactionDetails

};
