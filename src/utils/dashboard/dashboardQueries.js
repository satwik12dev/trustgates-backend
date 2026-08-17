// src/utils/dashboard/dashboardQueries.js

const DASHBOARD_QUERIES = {

    // =========================================
    // Dashboard Summary
    // =========================================

    GET_DASHBOARD_SUMMARY: `
        SELECT
            COUNT(*) AS total_transactions,

            SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) AS successful_transactions,

            SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed_transactions,

            SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_transactions,

            SUM(CASE WHEN status = 'CHARGEBACK' THEN 1 ELSE 0 END) AS chargebacks

        FROM transactions
        WHERE merchant_id = ?
    `,

    GET_AVAILABLE_BALANCE: `
        SELECT
            COALESCE(SUM(net_amount),0) AS available_balance
        FROM transaction_settlements
        WHERE merchant_id = ?
        AND settlement_status='PENDING'
    `,

    GET_SETTLED_AMOUNT: `
        SELECT
            COALESCE(SUM(net_amount),0) AS settled_amount
        FROM transaction_settlements
        WHERE merchant_id = ?
        AND settlement_status='SETTLED'
    `,

    // =========================================
    // Payment Analytics
    // =========================================

    GET_PAYMENT_METHOD_DISTRIBUTION: `
        SELECT
            payment_method,
            COUNT(*) AS total_transactions,
            COALESCE(SUM(amount),0) AS total_amount
        FROM transactions
        WHERE merchant_id = ?
    `,

    GET_PAYMENT_STATUS_ANALYTICS: `
        SELECT
            status,
            COUNT(*) AS total_transactions
        FROM transactions
        WHERE merchant_id = ?
    `,

    GET_TOTAL_REVENUE: `
        SELECT
            COALESCE(SUM(amount),0) AS total_revenue
        FROM transactions
        WHERE merchant_id = ?
        AND status='SUCCESS'
    `,

    GET_SUCCESSFUL_REVENUE: `
        SELECT
            COALESCE(SUM(amount),0) AS successful_revenue
        FROM transactions
        WHERE merchant_id = ?
        AND status='SUCCESS'
    `,

    GET_FAILED_REVENUE: `
        SELECT
            COALESCE(SUM(amount),0) AS failed_revenue
        FROM transactions
        WHERE merchant_id = ?
        AND status='FAILED'
    `,

    GET_REVENUE_TREND: `
        SELECT
            DATE(created_at) AS transaction_date,
            SUM(amount) AS revenue
        FROM transactions
        WHERE merchant_id = ?
        AND status='SUCCESS'
    `,

    GET_TRANSACTION_TREND: `
        SELECT
            DATE(created_at) AS transaction_date,
            COUNT(*) AS total_transactions
        FROM transactions
        WHERE merchant_id = ?
    `,

    GET_PAYMENT_SUCCESS_RATE: `
        SELECT
            COUNT(*) AS total_transactions,

            SUM(
                CASE
                    WHEN status='SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions

        FROM transactions
        WHERE merchant_id = ?
    `,

    GET_AVERAGE_TRANSACTION_AMOUNT: `
        SELECT
            COALESCE(AVG(amount),0) AS average_transaction_amount
        FROM transactions
        WHERE merchant_id = ?
        AND status='SUCCESS'
    `,

    GET_TOP_PAYMENT_METHOD: `
        SELECT
            payment_method,
            COUNT(*) AS total_transactions
        FROM transactions
        WHERE merchant_id = ?
    `,
    /**
 * Recent Transactions
 */
GET_RECENT_TRANSACTIONS: `
    SELECT

        transaction_id,
        order_id,
        provider_order_id,
        provider_payment_id,

        customer_name,
        customer_email,

        amount,
        currency,

        payment_method,
        payment_provider,

        status,

        created_at

    FROM transactions

    WHERE merchant_id = ?
`,/**
 * Total Recent Transactions
 */
GET_RECENT_TRANSACTIONS_COUNT: `
    SELECT

        COUNT(*) AS total_records

    FROM transactions

    WHERE merchant_id = ?
`,
/**
 * Settlement Summary
 */
GET_SETTLEMENT_SUMMARY: `
    SELECT

        settlement_id,

        transaction_id,

        merchant_id,

        gross_amount,

        gateway_fee,

        gst,

        tds,

        net_amount,

        settlement_status,

        settlement_date,

        created_at

    FROM transaction_settlements

    WHERE merchant_id = ?
`,
/**
 * Settlement Summary Count
 */
GET_SETTLEMENT_SUMMARY_COUNT: `
    SELECT

        COUNT(*) AS total_records

    FROM transaction_settlements

    WHERE merchant_id = ?
`,
GET_REFUND_SUMMARY: `
    SELECT

        r.refund_id,

        r.transaction_id,

        r.refund_reference,

        r.refund_amount,

        r.refund_status,

        r.refund_reason,

        r.refunded_at,

        r.created_at,

        t.order_id,

        t.customer_name,

        t.customer_email,

        t.payment_method,

        t.amount AS transaction_amount,

        t.status AS transaction_status

    FROM transaction_refunds r

    INNER JOIN transactions t
        ON r.transaction_id = t.transaction_id

    WHERE r.merchant_id = ?
`,
GET_REFUND_SUMMARY_COUNT: `
    SELECT

        COUNT(*) AS total_records

    FROM transaction_refunds r

    WHERE r.merchant_id = ?
`,
};

module.exports = DASHBOARD_QUERIES;