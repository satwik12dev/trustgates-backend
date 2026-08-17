const db = require("../../config/pool");

const NETBANKING_QUERIES =
    require("../../utils/admin/netbankingQueries");


// ==========================================================
// DATE RANGE
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
// NET BANKING DASHBOARD
// GET /netbanking
// ==========================================================

const getNetBankingTransactions = async ({

    merchantId = null,
    status = null,
    startDate = null,
    endDate = null,
    search = null,
    page = 1,
    limit = 20

}) => {

    const connection =
        await db.getConnection();

    try {

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


        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;

        const normalizedStatus =
            status || null;

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


        const [
            rows
        ] = await connection.query(

            NETBANKING_QUERIES
                .GET_NETBANKING_TRANSACTIONS,

            [

                // merchant
                normalizedMerchantId,
                normalizedMerchantId,

                // status
                normalizedStatus,
                normalizedStatus,

                // start date
                normalizedStartDate,
                normalizedStartDate,

                // end date
                normalizedEndDate,
                normalizedEndDate,

                // search
                normalizedSearch,

                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue

            ]

        );


        const totalRecords =
            rows.length;

        const transactions =
            rows.slice(
                offset,
                offset + currentLimit
            );


        return {

            page:
                currentPage,

            limit:
                currentLimit,

            totalRecords,

            count:
                transactions.length,

            totalPages:
                Math.ceil(
                    totalRecords /
                    currentLimit
                ),

            netBanking:
                transactions.map(row => ({

                    transactionNetBankingId:
                        row.transaction_netbanking_id,

                    transactionId:
                        row.transaction_id,

                    transactionRef:
                        row.transaction_ref,

                    merchantId:
                        row.merchant_id,

                    businessName:
                        row.business_name,

                    orderId:
                        row.order_id,

                    gatewayOrderId:
                        row.gateway_order_id,

                    gatewayPaymentId:
                        row.gateway_payment_id,

                    gatewayReference:
                        row.gateway_reference,

                    // NET BANKING
                    bankCode:
                        row.bank_code,

                    bankName:
                        row.bank_name,

                    bankTransactionId:
                        row.bank_transaction_id,

                    netBankingGatewayReference:
                        row.netbanking_gateway_reference,

                    // CUSTOMER
                    customerName:
                        row.customer_name,

                    customerEmail:
                        row.customer_email,

                    customerPhone:
                        row.customer_phone,

                    // TRANSACTION
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

                    // FEES
                    merchantFee:
                        Number(
                            row.merchant_fee || 0
                        ),

                    gatewayFee:
                        Number(
                            row.gateway_fee || 0
                        ),

                    gatewayTax:
                        Number(
                            row.gateway_tax || 0
                        ),

                    netAmount:
                        Number(
                            row.net_amount || 0
                        ),

                    // SETTLEMENT
                    settlementStatus:
                        row.settlement_status,

                    settledAt:
                        row.settled_at,

                    // FAILURE
                    failureCode:
                        row.failure_code,

                    failureMessage:
                        row.failure_message,

                    attemptCount:
                        row.attempt_count,

                    // DATES
                    createdAt:
                        row.created_at,

                    completedAt:
                        row.completed_at,

                    updatedAt:
                        row.updated_at,

                    netBankingCreatedAt:
                        row.netbanking_created_at,

                    netBankingUpdatedAt:
                        row.netbanking_updated_at

                }))

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// NET BANKING SUMMARY
// GET /netbanking/summary
// ==========================================================

const getNetBankingSummary = async ({

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

            NETBANKING_QUERIES
                .GET_NETBANKING_SUMMARY,

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
                ),

            averageTransactionValue:
                Number(
                    row.average_transaction_value || 0
                )

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// RECENT NET BANKING TRANSACTIONS
// GET /netbanking/recent
// ==========================================================

const getRecentNetBankingTransactions = async ({

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

            NETBANKING_QUERIES
                .GET_RECENT_NETBANKING_TRANSACTIONS,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                currentLimit

            ]

        );


        return {

            count:
                rows.length,

            netBanking:
                rows.map(row => ({

                    transactionNetBankingId:
                        row.transaction_netbanking_id,

                    transactionId:
                        row.transaction_id,

                    transactionRef:
                        row.transaction_ref,

                    merchantId:
                        row.merchant_id,

                    businessName:
                        row.business_name,

                    orderId:
                        row.order_id,

                    bankCode:
                        row.bank_code,

                    bankName:
                        row.bank_name,

                    bankTransactionId:
                        row.bank_transaction_id,

                    netBankingGatewayReference:
                        row.netbanking_gateway_reference,

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
// BANK ANALYTICS
// GET /netbanking/banks
// ==========================================================

const getNetBankBankAnalytics = async ({

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

            NETBANKING_QUERIES
                .GET_NETBANK_BANK_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            bankName:
                row.bank_name,

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
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// ACCOUNT TYPE ANALYTICS
// GET /netbanking/account-types
// ==========================================================

const getAccountTypeAnalytics = async ({

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

            NETBANKING_QUERIES
                .GET_NETBANK_ACCOUNT_TYPE_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            accountType:
                row.account_type,

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
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// STATUS ANALYTICS
// GET /netbanking/status
// ==========================================================

const getNetBankingStatusAnalytics = async ({

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

            NETBANKING_QUERIES
                .GET_NETBANK_STATUS_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            transactionStatus:
                row.transaction_status,

            totalTransactions:
                Number(
                    row.total_transactions || 0
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
// MERCHANT NET BANKING ANALYTICS
// GET /netbanking/merchant
// ==========================================================

const getMerchantNetBankingAnalytics = async ({

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

            NETBANKING_QUERIES
                .GET_MERCHANT_NETBANKING_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            merchantId:
                row.merchant_id,

            businessName:
                row.business_name,

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
// BANK CODE ANALYTICS
// GET /netbanking/bank-codes
// ==========================================================

const getBankCodeAnalytics = async ({

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

            NETBANKING_QUERIES
                .GET_NETBANK_BANK_CODE_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            bankCode:
                row.bank_code,

            bankName:
                row.bank_name,

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

    getNetBankingTransactions,

    getNetBankingSummary,

    getRecentNetBankingTransactions,

    getNetBankBankAnalytics,

    getAccountTypeAnalytics,

    getNetBankingStatusAnalytics,

    getMerchantNetBankingAnalytics,

    getBankCodeAnalytics

};