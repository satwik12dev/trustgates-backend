const db = require("../../config/pool");

const UPI_QUERIES =
    require("../../utils/admin/upiQueries");


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
// UPI TRANSACTIONS
// ==========================================================

const getUpiTransactions = async ({

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


        // ==================================================
        // NORMALIZE FILTERS
        // ==================================================

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


        // ==================================================
        // QUERY
        // ==================================================

        const [
            rows
        ] = await connection.query(

            UPI_QUERIES
                .GET_UPI_TRANSACTIONS,

            [

                // merchantId
                normalizedMerchantId,
                normalizedMerchantId,

                // status
                normalizedStatus,
                normalizedStatus,

                // startDate
                normalizedStartDate,
                normalizedStartDate,

                // endDate
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
                searchValue,
                searchValue,
                searchValue

            ]

        );


        // ==================================================
        // PAGINATION
        // ==================================================

        const paginatedRows =
            rows.slice(
                offset,
                offset + currentLimit
            );


        // ==================================================
        // RESPONSE
        // ==================================================

        const transactions =
            paginatedRows.map((row) => ({

                transactionUpiId:
                    row.transaction_upi_id,

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

                // ------------------------------
                // UPI DETAILS
                // ------------------------------

                vpa:
                    row.vpa,

                payerName:
                    row.payer_name,

                payerAccountType:
                    row.payer_account_type,

                rrn:
                    row.rrn,

                npciTransactionId:
                    row.npci_transaction_id,

                bankReference:
                    row.bank_reference,

                gatewayResponseCode:
                    row.gateway_response_code,

                gatewayResponseMessage:
                    row.gateway_response_message,

                // ------------------------------
                // CUSTOMER
                // ------------------------------

                customerName:
                    row.customer_name,

                customerEmail:
                    row.customer_email,

                customerPhone:
                    row.customer_phone,

                // ------------------------------
                // TRANSACTION
                // ------------------------------

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

                // ------------------------------
                // FEES
                // ------------------------------

                merchantFee:
                    Number(row.merchant_fee || 0),

                gatewayFee:
                    Number(row.gateway_fee || 0),

                gatewayTax:
                    Number(row.gateway_tax || 0),

                netAmount:
                    Number(row.net_amount || 0),

                // ------------------------------
                // SETTLEMENT
                // ------------------------------

                settlementStatus:
                    row.settlement_status,

                settledAt:
                    row.settled_at,

                // ------------------------------
                // FAILURE
                // ------------------------------

                failureCode:
                    row.failure_code,

                failureMessage:
                    row.failure_message,

                attemptCount:
                    row.attempt_count,

                // ------------------------------
                // DATES
                // ------------------------------

                createdAt:
                    row.created_at,

                completedAt:
                    row.completed_at,

                updatedAt:
                    row.updated_at,

                upiCreatedAt:
                    row.upi_created_at,

                upiUpdatedAt:
                    row.upi_updated_at

            }));


        return {

            page:
                currentPage,

            limit:
                currentLimit,

            totalRecords:
                rows.length,

            count:
                transactions.length,

            totalPages:
                Math.ceil(
                    rows.length /
                    currentLimit
                ),

            transactions

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// UPI SUMMARY
// ==========================================================

const getUpiSummary = async ({

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

            UPI_QUERIES
                .GET_UPI_SUMMARY,

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
// RECENT UPI TRANSACTIONS
// ==========================================================

const getRecentUpiTransactions = async ({

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

            UPI_QUERIES
                .GET_RECENT_UPI_TRANSACTIONS,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                currentLimit

            ]

        );


        return {

            count:
                rows.length,

            transactions:
                rows.map((row) => ({

                    transactionUpiId:
                        row.transaction_upi_id,

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

                    vpa:
                        row.vpa,

                    payerName:
                        row.payer_name,

                    payerAccountType:
                        row.payer_account_type,

                    rrn:
                        row.rrn,

                    npciTransactionId:
                        row.npci_transaction_id,

                    bankReference:
                        row.bank_reference,

                    gatewayResponseCode:
                        row.gateway_response_code,

                    gatewayResponseMessage:
                        row.gateway_response_message,

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
// UPI ANALYTICS
// ==========================================================

const getUpiAnalytics = async ({

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

            UPI_QUERIES
                .GET_UPI_ANALYTICS,

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

            refundedTransactions:
                Number(
                    row.refunded_transactions || 0
                ),

            successfulAmount:
                Number(
                    row.successful_amount || 0
                ),

            totalAmount:
                Number(
                    row.total_amount || 0
                ),

            refundedAmount:
                Number(
                    row.refunded_amount || 0
                ),

            netRevenue:
                Number(
                    row.net_revenue || 0
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// BANK ANALYTICS
// ==========================================================

const getBankAnalytics = async ({

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

            UPI_QUERIES
                .GET_UPI_BANK_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map((row) => ({

            bank:
                row.bank || "UNKNOWN",

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
// MERCHANT UPI ANALYTICS
// ==========================================================

const getMerchantUpiAnalytics = async ({

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

            UPI_QUERIES
                .GET_MERCHANT_UPI_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map((row) => ({

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
// UPI VERIFICATION ANALYTICS
// ==========================================================

const getUpiVerificationAnalytics = async ({

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

            UPI_QUERIES
                .GET_UPI_VERIFICATION_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map((row) => ({

            responseCode:
                row.response_code,

            responseMessage:
                row.response_message,

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

    getUpiTransactions,

    getUpiSummary,

    getRecentUpiTransactions,

    getUpiAnalytics,

    getBankAnalytics,

    getMerchantUpiAnalytics,

    getUpiVerificationAnalytics

};