const db = require(
    "../../config/pool"
);

const ANALYTICS_QUERIES = require(
    "../../utils/admin/analyticsQueries"
);


// ==========================================================
// Helper: Normalize Number
// ==========================================================

const toNumber = (value) => {

    return Number(value || 0);

};


// ==========================================================
// GET ANALYTICS OVERVIEW
// ==========================================================

const getAnalyticsOverview = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_ANALYTICS_OVERVIEW,

            [
                type,
                startDate,
                endDate,
                merchantId,
                merchantId
            ]

        );

        const row =
            rows[0] || {};

        const totalTransactions =
            toNumber(
                row.total_transactions
            );

        const successfulTransactions =
            toNumber(
                row.successful_transactions
            );

        const successRate =
            totalTransactions > 0
                ? Number(
                    (
                        successfulTransactions /
                        totalTransactions *
                        100
                    ).toFixed(2)
                )
                : 0;

        return {

            totalTransactions,

            successfulTransactions,

            failedTransactions:
                toNumber(
                    row.failed_transactions
                ),

            pendingTransactions:
                toNumber(
                    row.pending_transactions
                ),

            createdTransactions:
                toNumber(
                    row.created_transactions
                ),

            refundedTransactions:
                toNumber(
                    row.refunded_transactions
                ),

            chargebackTransactions:
                toNumber(
                    row.chargeback_transactions
                ),

            totalRevenue:
                toNumber(
                    row.total_revenue
                ),

            averageTransactionValue:
                Number(
                    toNumber(
                        row.average_transaction_value
                    ).toFixed(2)
                ),

            successRate

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// TRANSACTION TREND
// ==========================================================

const getTransactionTrend = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_TRANSACTION_TREND,

            [
                type,
                startDate,
                endDate,
                merchantId,
                merchantId
            ]

        );

        return rows.map(
            (row) => ({

                date:
                    row.report_date,

                totalTransactions:
                    toNumber(
                        row.total_transactions
                    ),

                successfulTransactions:
                    toNumber(
                        row.successful_transactions
                    ),

                failedTransactions:
                    toNumber(
                        row.failed_transactions
                    ),

                pendingTransactions:
                    toNumber(
                        row.pending_transactions
                    )

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// REVENUE TREND
// ==========================================================

const getRevenueTrend = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_REVENUE_TREND,

            [
                type,
                startDate,
                endDate,
                merchantId,
                merchantId
            ]

        );

        return rows.map(
            (row) => ({

                date:
                    row.report_date,

                successfulTransactions:
                    toNumber(
                        row.successful_transactions
                    ),

                revenue:
                    toNumber(
                        row.revenue
                    )

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// PAYMENT METHOD DISTRIBUTION
// ==========================================================

const getPaymentMethodDistribution = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_PAYMENT_METHOD_DISTRIBUTION,

            [
                type,
                startDate,
                endDate,
                merchantId,
                merchantId
            ]

        );

        return rows.map(
            (row) => ({

                paymentMethod:
                    row.payment_method,

                totalTransactions:
                    toNumber(
                        row.total_transactions
                    ),

                successfulTransactions:
                    toNumber(
                        row.successful_transactions
                    ),

                successfulAmount:
                    toNumber(
                        row.successful_amount
                    )

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// PAYMENT PROVIDER DISTRIBUTION
// ==========================================================

const getPaymentProviderDistribution = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_PAYMENT_PROVIDER_DISTRIBUTION,

            [
                type,
                startDate,
                endDate,
                merchantId,
                merchantId
            ]

        );

        return rows.map(
            (row) => ({

                paymentProvider:
                    row.payment_provider,

                totalTransactions:
                    toNumber(
                        row.total_transactions
                    ),

                successfulTransactions:
                    toNumber(
                        row.successful_transactions
                    ),

                failedTransactions:
                    toNumber(
                        row.failed_transactions
                    ),

                successfulAmount:
                    toNumber(
                        row.successful_amount
                    )

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// MERCHANT PERFORMANCE
// ==========================================================

// ==========================================================
// MERCHANT PERFORMANCE
// ==========================================================

const getMerchantPerformance = async ({
    type,
    merchantId = null,
    startDate,
    endDate,
    limit = 10
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_MERCHANT_PERFORMANCE,

            [
                type,
                startDate,
                endDate,
                merchantId,
                merchantId,
                limit
            ]

        );


        return rows.map(
            (row) => ({

                // ==========================================
                // Merchant
                // ==========================================

                merchantId:
                    row.merchant_id,

                businessName:
                    row.business_name,


                // ==========================================
                // Total
                // ==========================================

                totalTransactions:
                    toNumber(
                        row.total_transactions
                    ),


                // ==========================================
                // Success
                // ==========================================

                successfulTransactions:
                    toNumber(
                        row.successful_transactions
                    ),


                // ==========================================
                // Created
                // ==========================================

                createdTransactions:
                    toNumber(
                        row.created_transactions
                    ),


                // ==========================================
                // Pending
                // ==========================================

                pendingTransactions:
                    toNumber(
                        row.pending_transactions
                    ),


                // ==========================================
                // Authorized
                // ==========================================

                authorizedTransactions:
                    toNumber(
                        row.authorized_transactions
                    ),


                // ==========================================
                // Failed
                // ==========================================

                failedTransactions:
                    toNumber(
                        row.failed_transactions
                    ),


                // ==========================================
                // Cancelled
                // ==========================================

                cancelledTransactions:
                    toNumber(
                        row.cancelled_transactions
                    ),


                // ==========================================
                // Refunded
                // ==========================================

                refundedTransactions:
                    toNumber(
                        row.refunded_transactions
                    ),


                // ==========================================
                // Partially Refunded
                // ==========================================

                partiallyRefundedTransactions:
                    toNumber(
                        row.partially_refunded_transactions
                    ),


                // ==========================================
                // Chargeback
                // ==========================================

                chargebackTransactions:
                    toNumber(
                        row.chargeback_transactions
                    ),


                // ==========================================
                // Revenue
                // ==========================================

                revenue:
                    toNumber(
                        row.revenue
                    )

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// HOURLY TRANSACTIONS
// ==========================================================

const getHourlyTransactions = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_HOURLY_TRANSACTIONS,

            [
                type,
                startDate,
                endDate,
                merchantId,
                merchantId
            ]

        );

        return rows.map(
            (row) => ({

                hour:
                    Number(
                        row.transaction_hour
                    ),

                totalTransactions:
                    toNumber(
                        row.total_transactions
                    ),

                successfulTransactions:
                    toNumber(
                        row.successful_transactions
                    ),

                failedTransactions:
                    toNumber(
                        row.failed_transactions
                    ),

                pendingTransactions:
                    toNumber(
                        row.pending_transactions
                    )

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// CURRENCY ANALYTICS
// ==========================================================

const getCurrencyAnalytics = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_CURRENCY_ANALYTICS,

            [
                type,
                startDate,
                endDate,
                merchantId,
                merchantId
            ]

        );

        return rows.map(
            (row) => ({

                currency:
                    row.currency,

                totalTransactions:
                    toNumber(
                        row.total_transactions
                    ),

                successfulTransactions:
                    toNumber(
                        row.successful_transactions
                    ),

                successfulAmount:
                    toNumber(
                        row.successful_amount
                    )

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// STATUS ANALYTICS
// ==========================================================

const getStatusAnalytics = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_STATUS_ANALYTICS,

            [
                type,
                startDate,
                endDate,
                merchantId,
                merchantId
            ]

        );

        return rows.map(
            (row) => ({

                status:
                    row.transaction_status,

                totalTransactions:
                    toNumber(
                        row.total_transactions
                    ),

                totalAmount:
                    toNumber(
                        row.total_amount
                    )

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// COMPLETE ANALYTICS
// ==========================================================
// One API response containing all analytics.
//
// ==========================================================

const getDashboardAnalytics = async ({
    type,
    merchantId = null,
    startDate,
    endDate,
    limit = 10
}) => {

    const [

        overview,

        transactionTrend,

        revenueTrend,

        paymentMethodDistribution,

        paymentProviderDistribution,

        merchantPerformance,

        hourlyTransactions,

        currencyAnalytics,

        statusAnalytics

    ] = await Promise.all([

        getAnalyticsOverview({

            type,
            merchantId,
            startDate,
            endDate

        }),

        getTransactionTrend({

            type,
            merchantId,
            startDate,
            endDate

        }),

        getRevenueTrend({

            type,
            merchantId,
            startDate,
            endDate

        }),

        getPaymentMethodDistribution({

            type,
            merchantId,
            startDate,
            endDate

        }),

        getPaymentProviderDistribution({

            type,
            merchantId,
            startDate,
            endDate

        }),

        getMerchantPerformance({

            type,
            merchantId,
            startDate,
            endDate,
            limit

        }),

        getHourlyTransactions({

            type,
            merchantId,
            startDate,
            endDate

        }),

        getCurrencyAnalytics({

            type,
            merchantId,
            startDate,
            endDate

        }),

        getStatusAnalytics({

            type,
            merchantId,
            startDate,
            endDate

        })

    ]);


    return {

        overview,

        transactionTrend,

        revenueTrend,

        paymentMethodDistribution,

        paymentProviderDistribution,

        merchantPerformance,

        hourlyTransactions,

        currencyAnalytics,

        statusAnalytics

    };

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

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

};