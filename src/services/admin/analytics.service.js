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

const getAnalyticsOverview = async () => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_ANALYTICS_OVERVIEW

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
                        (
                            successfulTransactions /
                            totalTransactions
                        ) * 100
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
    startDate = null,
    endDate = null
} = {}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_TRANSACTION_TREND,

            [
                startDate,
                endDate
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

const getRevenueTrend = async () => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_REVENUE_TREND

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

const getPaymentMethodDistribution = async () => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_PAYMENT_METHOD_DISTRIBUTION

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

const getPaymentProviderDistribution = async () => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_PAYMENT_PROVIDER_DISTRIBUTION

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

const getMerchantPerformance = async ({
    limit = 10
} = {}) => {

    const connection =
        await db.getConnection();

    try {

        const safeLimit =
            Number(limit) > 0
                ? Math.min(
                    Number(limit),
                    100
                )
                : 10;


        /*
         * IMPORTANT:
         *
         * LIMIT cannot safely be written as:
         *
         * LIMIT ?
         *
         * depending on the query/client setup.
         *
         * Therefore the validated numeric value
         * is inserted into the query string.
         */

        const query =
            ANALYTICS_QUERIES
                .GET_MERCHANT_PERFORMANCE
                .replace(
                    /LIMIT\s+\d+/i,
                    `LIMIT ${safeLimit}`
                );


        const [
            rows
        ] = await connection.query(
            query
        );


        return rows.map(
            (row) => ({

                merchantId:
                    row.merchant_id,

                businessName:
                    row.business_name,

                totalTransactions:
                    toNumber(
                        row.total_transactions
                    ),

                successfulTransactions:
                    toNumber(
                        row.successful_transactions
                    ),

                createdTransactions:
                    toNumber(
                        row.created_transactions
                    ),

                pendingTransactions:
                    toNumber(
                        row.pending_transactions
                    ),

                authorizedTransactions:
                    toNumber(
                        row.authorized_transactions
                    ),

                failedTransactions:
                    toNumber(
                        row.failed_transactions
                    ),

                cancelledTransactions:
                    toNumber(
                        row.cancelled_transactions
                    ),

                refundedTransactions:
                    toNumber(
                        row.refunded_transactions
                    ),

                partiallyRefundedTransactions:
                    toNumber(
                        row.partially_refunded_transactions
                    ),

                chargebackTransactions:
                    toNumber(
                        row.chargeback_transactions
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
// HOURLY TRANSACTIONS
// ==========================================================

const getHourlyTransactions = async ({
    date
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
                date,
                date
            ]

        );

        return rows.map(
            (row) => ({

                hour:
                    Number(
                        row.transaction_hour
                    ),

                totalTransactions:
                    Number(
                        row.total_transactions || 0
                    ),

                successfulTransactions:
                    Number(
                        row.successful_transactions || 0
                    ),

                failedTransactions:
                    Number(
                        row.failed_transactions || 0
                    ),

                pendingTransactions:
                    Number(
                        row.pending_transactions || 0
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

const getCurrencyAnalytics = async () => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_CURRENCY_ANALYTICS

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

const getStatusAnalytics = async () => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            ANALYTICS_QUERIES
                .GET_STATUS_ANALYTICS

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

const getDashboardAnalytics = async ({
    limit = 10
} = {}) => {

    const [

        overview,

        revenueTrend,

        paymentMethodDistribution,

        paymentProviderDistribution,

        merchantPerformance,

        currencyAnalytics,

        statusAnalytics

    ] = await Promise.all([

        getAnalyticsOverview(),

        getRevenueTrend(),

        getPaymentMethodDistribution(),

        getPaymentProviderDistribution(),

        getMerchantPerformance({
            limit
        }),

        getCurrencyAnalytics(),

        getStatusAnalytics()

    ]);


    return {

        overview,

        revenueTrend,

        paymentMethodDistribution,

        paymentProviderDistribution,

        merchantPerformance,

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
