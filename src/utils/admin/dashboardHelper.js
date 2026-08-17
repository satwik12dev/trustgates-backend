const db = require("../../config/pool");


// ==========================================================
// Helper: Merchant Filter
// ==========================================================

const buildMerchantFilter = (
    merchantId,
    column = "merchant_id"
) => {

    if (
        merchantId === null ||
        merchantId === undefined ||
        merchantId === ""
    ) {

        return {
            condition: "",
            params: []
        };

    }

    return {
        condition: `AND ${column} = ?`,
        params: [
            Number(merchantId)
        ]
    };

};


// ==========================================================
// Helper: Execute Query
// ==========================================================

const executeQuery = async (
    query,
    params = []
) => {

    const [
        rows
    ] = await db.query(
        query,
        params
    );

    return rows;

};


// ==========================================================
// 1. DASHBOARD TRANSACTION SUMMARY
// ==========================================================

const getDashboardSummary = async ({
    startDate,
    endDate,
    merchantId = null,
    paymentType = "PAYIN"
}) => {

    const merchantFilter =
        buildMerchantFilter(
            merchantId
        );


    const query = `

        SELECT

            COUNT(*) AS totalTransactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successfulTransactions,

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failedTransactions,

            SUM(
                CASE
                    WHEN status IN (
                        'PENDING',
                        'CREATED',
                        'AUTHORIZED'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS pendingTransactions,

            COALESCE(
                SUM(amount),
                0
            ) AS totalAmount,

            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'SUCCESS'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS successfulAmount,

            COALESCE(
                SUM(
                    CASE
                        WHEN status IN (
                            'PENDING',
                            'CREATED',
                            'AUTHORIZED'
                        )
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS pendingAmount

        FROM transactions

        WHERE payment_type = ?

          AND created_at >= ?

          AND created_at < ?

          ${merchantFilter.condition}

    `;


    const rows =
        await executeQuery(
            query,
            [

                paymentType,

                startDate,

                endDate,

                ...merchantFilter.params

            ]
        );


    return rows[0] || {};

};


// ==========================================================
// 2. REFUND COUNT
// ==========================================================

const getRefundCount = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    const merchantFilter =
        buildMerchantFilter(
            merchantId
        );


    const query = `

        SELECT

            COUNT(*) AS refundCount

        FROM transaction_refunds

        WHERE created_at >= ?

          AND created_at < ?

          ${merchantFilter.condition}

    `;


    const rows =
        await executeQuery(
            query,
            [

                startDate,

                endDate,

                ...merchantFilter.params

            ]
        );


    return rows[0] || {};

};


// ==========================================================
// 3. TODAY'S REVENUE
// ==========================================================
//
// Successful transaction amount only.
// No fee deduction.
// ==========================================================

const getTodaysRevenue = async ({
    startDate,
    endDate,
    merchantId = null,
    paymentType = "PAYIN"
}) => {

    const merchantFilter =
        buildMerchantFilter(
            merchantId
        );


    const query = `

        SELECT

            COALESCE(
                SUM(amount),
                0
            ) AS todaysRevenue

        FROM transactions

        WHERE payment_type = ?

          AND status = 'SUCCESS'

          AND created_at >= ?

          AND created_at < ?

          ${merchantFilter.condition}

    `;


    const rows =
        await executeQuery(
            query,
            [

                paymentType,

                startDate,

                endDate,

                ...merchantFilter.params

            ]
        );


    return rows[0] || {};

};


// ==========================================================
// 4. MONTHLY REVENUE
// ==========================================================
//
// The service should provide the requested month's
// startDate and endDate.
// ==========================================================

const getMonthlyRevenue = async ({
    startDate,
    endDate,
    merchantId = null,
    paymentType = "PAYIN"
}) => {

    const merchantFilter =
        buildMerchantFilter(
            merchantId
        );


    const query = `

        SELECT

            COALESCE(
                SUM(amount),
                0
            ) AS monthlyRevenue

        FROM transactions

        WHERE payment_type = ?

          AND status = 'SUCCESS'

          AND created_at >= ?

          AND created_at < ?

          ${merchantFilter.condition}

    `;


    const rows =
        await executeQuery(
            query,
            [

                paymentType,

                startDate,

                endDate,

                ...merchantFilter.params

            ]
        );


    return rows[0] || {};

};


// ==========================================================
// 5. AVAILABLE BALANCE
// ==========================================================
//
// Source:
// merchant_wallets.available_balance
//
// No transaction fee calculation.
// ==========================================================

const getAvailableBalance = async ({
    merchantId = null
}) => {

    const merchantFilter =
        buildMerchantFilter(
            merchantId
        );


    const query = `

        SELECT

            COALESCE(
                SUM(available_balance),
                0
            ) AS availableBalance

        FROM merchant_wallets

        WHERE 1 = 1

          ${merchantFilter.condition}

    `;


    const rows =
        await executeQuery(
            query,
            [
                ...merchantFilter.params
            ]
        );


    return rows[0] || {};

};


// ==========================================================
// 6. SETTLED AMOUNT
// ==========================================================
//
// Current wallet's cumulative settled amount.
//
// Source:
// merchant_wallets.total_settled
//
// IMPORTANT:
// This is not date-wise settlement calculation.
// ==========================================================

const getSettledAmount = async ({
    merchantId = null
}) => {

    const merchantFilter =
        buildMerchantFilter(
            merchantId
        );


    const query = `

        SELECT

            COALESCE(
                SUM(total_settled),
                0
            ) AS settledAmount

        FROM merchant_wallets

        WHERE 1 = 1

          ${merchantFilter.condition}

    `;


    const rows =
        await executeQuery(
            query,
            [
                ...merchantFilter.params
            ]
        );


    return rows[0] || {};

};


// ==========================================================
// 7. DAILY TRANSACTION TREND
// ==========================================================
//
// Optional dashboard chart.
// No fees.
// ==========================================================

const getDailyTransactionTrend = async ({
    startDate,
    endDate,
    merchantId = null,
    paymentType = "PAYIN"
}) => {

    const merchantFilter =
        buildMerchantFilter(
            merchantId
        );


    const query = `

        SELECT

            DATE(created_at) AS reportDate,

            COUNT(*) AS totalTransactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successfulTransactions,

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failedTransactions,

            SUM(
                CASE
                    WHEN status IN (
                        'PENDING',
                        'CREATED',
                        'AUTHORIZED'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS pendingTransactions,

            COALESCE(
                SUM(amount),
                0
            ) AS totalAmount

        FROM transactions

        WHERE payment_type = ?

          AND created_at >= ?

          AND created_at < ?

          ${merchantFilter.condition}

        GROUP BY DATE(created_at)

        ORDER BY reportDate ASC

    `;


    return executeQuery(
        query,
        [

            paymentType,

            startDate,

            endDate,

            ...merchantFilter.params

        ]
    );

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    getDashboardSummary,

    getRefundCount,

    getTodaysRevenue,

    getMonthlyRevenue,

    getAvailableBalance,

    getSettledAmount,

    getDailyTransactionTrend

};