const db = require("../../config/pool");

const WALLET_QUERIES =
    require("../../utils/admin/walletQueries");


// ==========================================================
// DATE RANGE HELPER
// ==========================================================

const normalizeDateRange = (
    startDate = null,
    endDate = null
) => {

    return {

        startDate:
            startDate ||
            "1970-01-01 00:00:00",

        endDate:
            endDate ||
            "2999-12-31 23:59:59"

    };

};


// ==========================================================
// WALLET TRANSACTIONS
// ==========================================================

const getWalletTransactions = async ({

    merchantId = null,
    status = null,
    walletName = null,

    startDate = null,
    endDate = null,

    search = null,

    page = 1,
    limit = 20

}) => {

    const connection =
        await db.getConnection();

    try {

        // ==================================================
        // Pagination
        // ==================================================

        const currentPage =
            Number(page) > 0
                ? Number(page)
                : 1;

        const currentLimit =
            Number(limit) > 0
                ? Math.min(Number(limit), 100)
                : 20;

        const offset =
            (currentPage - 1) *
            currentLimit;


        // ==================================================
        // Filters
        // ==================================================

        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;

        const normalizedStatus =
            status || null;

        const normalizedWalletName =
            walletName
                ? walletName.trim()
                : null;

        const normalizedStartDate =
            startDate || null;

        const normalizedEndDate =
            endDate || null;

        const normalizedSearch =
            search && search.trim()
                ? search.trim()
                : null;


        const searchValue =
            normalizedSearch
                ? `%${normalizedSearch}%`
                : null;


        // ==================================================
        // Query
        // ==================================================

        const [
            rows
        ] = await connection.query(

            WALLET_QUERIES
                .GET_WALLET_TRANSACTIONS,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                normalizedStatus,
                normalizedStatus,

                normalizedWalletName,
                normalizedWalletName,

                normalizedStartDate,
                normalizedStartDate,

                normalizedEndDate,
                normalizedEndDate,

                normalizedSearch,

                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue

            ]

        );


        // ==================================================
        // Pagination
        // ==================================================

        const paginatedRows =
            rows.slice(
                offset,
                offset + currentLimit
            );


        // ==================================================
        // Mapping
        // ==================================================

        const wallets =
            paginatedRows.map((row) => ({

                transactionWalletId:
                    row.transaction_wallet_id,

                transactionId:
                    row.transaction_id,

                walletName:
                    row.wallet_name,

                walletTransactionId:
                    row.wallet_transaction_id,

                gatewayReference:
                    row.gateway_reference,

                merchantId:
                    row.merchant_id,

                businessName:
                    row.business_name,

                transactionRef:
                    row.transaction_ref,

                orderId:
                    row.order_id,

                gatewayOrderId:
                    row.gateway_order_id,

                gatewayPaymentId:
                    row.gateway_payment_id,

                customerName:
                    row.customer_name,

                customerEmail:
                    row.customer_email,

                customerPhone:
                    row.customer_phone,

                amount:
                    Number(row.amount || 0),

                currency:
                    row.currency,

                paymentMethod:
                    row.payment_method,

                paymentType:
                    row.payment_type,

                status:
                    row.status,

                merchantFee:
                    Number(row.merchant_fee || 0),

                gatewayFee:
                    Number(row.gateway_fee || 0),

                gatewayTax:
                    Number(row.gateway_tax || 0),

                netAmount:
                    Number(row.net_amount || 0),

                settlementStatus:
                    row.settlement_status,

                settledAt:
                    row.settled_at,

                failureCode:
                    row.failure_code,

                failureMessage:
                    row.failure_message,

                attemptCount:
                    row.attempt_count,

                createdAt:
                    row.created_at,

                completedAt:
                    row.completed_at,

                updatedAt:
                    row.updated_at,

                walletCreatedAt:
                    row.wallet_created_at,

                walletUpdatedAt:
                    row.wallet_updated_at

            }));


        return {

            page:
                currentPage,

            limit:
                currentLimit,

            totalRecords:
                rows.length,

            count:
                wallets.length,

            totalPages:
                Math.ceil(
                    rows.length /
                    currentLimit
                ),

            wallets

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// WALLET SUMMARY
// ==========================================================

const getWalletSummary = async ({

    merchantId = null,
    startDate = null,
    endDate = null

}) => {

    const connection =
        await db.getConnection();

    try {

        const range =
            normalizeDateRange(
                startDate,
                endDate
            );


        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;


        const [
            rows
        ] = await connection.query(

            WALLET_QUERIES
                .GET_WALLET_SUMMARY,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                range.startDate,
                range.endDate

            ]

        );


        const row =
            rows[0] || {};


        return {

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
                ),

            cancelledTransactions:
                Number(
                    row.cancelled_transactions || 0
                ),

            refundedTransactions:
                Number(
                    row.refunded_transactions || 0
                ),

            partiallyRefundedTransactions:
                Number(
                    row.partially_refunded_transactions || 0
                ),

            chargebackTransactions:
                Number(
                    row.chargeback_transactions || 0
                ),

            totalAmount:
                Number(
                    row.total_amount || 0
                ),

            successfulAmount:
                Number(
                    row.successful_amount || 0
                )

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// RECENT WALLET TRANSACTIONS
// ==========================================================

const getRecentWalletTransactions = async ({

    merchantId = null,
    limit = 10

}) => {

    const connection =
        await db.getConnection();

    try {

        const currentLimit =
            Number(limit) > 0
                ? Math.min(Number(limit), 50)
                : 10;


        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;


        const [
            rows
        ] = await connection.query(

            WALLET_QUERIES
                .GET_RECENT_WALLET_TRANSACTIONS,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                currentLimit

            ]

        );


        return {

            count:
                rows.length,

            wallets:
                rows.map((row) => ({

                    transactionWalletId:
                        row.transaction_wallet_id,

                    transactionId:
                        row.transaction_id,

                    walletName:
                        row.wallet_name,

                    walletTransactionId:
                        row.wallet_transaction_id,

                    gatewayReference:
                        row.gateway_reference,

                    transactionRef:
                        row.transaction_ref,

                    merchantId:
                        row.merchant_id,

                    businessName:
                        row.business_name,

                    orderId:
                        row.order_id,

                    customerName:
                        row.customer_name,

                    customerEmail:
                        row.customer_email,

                    amount:
                        Number(
                            row.amount || 0
                        ),

                    currency:
                        row.currency,

                    paymentMethod:
                        row.payment_method,

                    paymentType:
                        row.payment_type,

                    status:
                        row.status,

                    createdAt:
                        row.created_at,

                    completedAt:
                        row.completed_at

                }))

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// WALLET ANALYTICS
// ==========================================================

const getWalletAnalytics = async ({

    merchantId = null,
    startDate = null,
    endDate = null

}) => {

    const connection =
        await db.getConnection();

    try {

        const range =
            normalizeDateRange(
                startDate,
                endDate
            );


        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;


        const [
            rows
        ] = await connection.query(

            WALLET_QUERIES
                .GET_WALLET_ANALYTICS,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                range.startDate,
                range.endDate

            ]

        );


        return rows.map((row) => ({

            date:
                row.report_date,

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
                ),

            successfulAmount:
                Number(
                    row.successful_amount || 0
                ),

            totalAmount:
                Number(
                    row.total_amount || 0
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// WALLET STATUS ANALYTICS
// ==========================================================

const getWalletStatusAnalytics = async ({

    merchantId = null,
    startDate = null,
    endDate = null

}) => {

    const connection =
        await db.getConnection();

    try {

        const range =
            normalizeDateRange(
                startDate,
                endDate
            );


        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;


        const [
            rows
        ] = await connection.query(

            WALLET_QUERIES
                .GET_WALLET_STATUS_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map((row) => ({

            status:
                row.status,

            totalTransactions:
                Number(
                    row.total_transactions || 0
                ),

            totalAmount:
                Number(
                    row.total_amount || 0
                ),

            successfulAmount:
                Number(
                    row.successful_amount || 0
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// TOP WALLETS
// ==========================================================

const getTopWallets = async ({

    merchantId = null,
    startDate = null,
    endDate = null

}) => {

    const connection =
        await db.getConnection();

    try {

        const range =
            normalizeDateRange(
                startDate,
                endDate
            );


        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;


        const [
            rows
        ] = await connection.query(

            WALLET_QUERIES
                .GET_TOP_WALLETS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map((row) => ({

            walletName:
                row.wallet_name,

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
                ),

            revenue:
                Number(
                    row.revenue || 0
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    getWalletTransactions,

    getWalletSummary,

    getRecentWalletTransactions,

    getWalletAnalytics,

    getWalletStatusAnalytics,

    getTopWallets

};