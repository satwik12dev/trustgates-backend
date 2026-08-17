const db = require("../../config/pool");

const PAYLATER_QUERIES =require("../../utils/admin/paylaterQueries");


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
// PAY LATER DASHBOARD
// GET /paylater
// ==========================================================

const getPayLaterTransactions = async ({
    merchantId = null,
    status = null,
    startDate = null,
    endDate = null,
    search = null,
    page = 1,
    limit = 20
}) => {

    const connection = await db.getConnection();

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

            PAYLATER_QUERIES
                .GET_PAYLATER_TRANSACTIONS,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                normalizedStatus,
                normalizedStatus,

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
                searchValue,
                searchValue,
                searchValue

            ]

        );


        const totalRecords =
            rows.length;

        const paginatedRows =
            rows.slice(
                offset,
                offset + currentLimit
            );


        return {

            merchantId:
                normalizedMerchantId,

            filters: {

                startDate:
                    normalizedStartDate,

                endDate:
                    normalizedEndDate,

                status:
                    normalizedStatus,

                search:
                    normalizedSearch

            },

            page:
                currentPage,

            limit:
                currentLimit,

            totalRecords,

            count:
                paginatedRows.length,

            totalPages:
                Math.ceil(
                    totalRecords /
                    currentLimit
                ),

            paylater:
                paginatedRows.map(row => ({

                    transactionPayLaterId:
                        row.transaction_paylater_id,

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

                    // PAY LATER
                    providerName:
                        row.provider_name,

                    loanReference:
                        row.loan_reference,

                    dueDate:
                        row.due_date,

                    payLaterGatewayReference:
                        row.paylater_gateway_reference,

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

                    payLaterCreatedAt:
                        row.paylater_created_at,

                    payLaterUpdatedAt:
                        row.paylater_updated_at

                }))

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// PAY LATER SUMMARY
// GET /paylater/summary
// ==========================================================

const getPayLaterSummary = async ({
    merchantId = null,
    startDate = null,
    endDate = null
}) => {

    const connection = await db.getConnection();

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

            PAYLATER_QUERIES
                .GET_PAYLATER_SUMMARY,

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
                ),

            transactionsWithDueDate:
                Number(
                    row.transactions_with_due_date || 0
                )

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// RECENT PAY LATER
// GET /paylater/recent
// ==========================================================

const getRecentPayLaterTransactions = async ({
    merchantId = null,
    limit = 10
}) => {

    const connection = await db.getConnection();

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

            PAYLATER_QUERIES
                .GET_RECENT_PAYLATER_TRANSACTIONS,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                currentLimit

            ]

        );


        return {

            count:
                rows.length,

            paylater:
                rows.map(row => ({

                    transactionPayLaterId:
                        row.transaction_paylater_id,

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

                    providerName:
                        row.provider_name,

                    loanReference:
                        row.loan_reference,

                    dueDate:
                        row.due_date,

                    payLaterGatewayReference:
                        row.paylater_gateway_reference,

                    customerName:
                        row.customer_name,

                    customerEmail:
                        row.customer_email,

                    customerPhone:
                        row.customer_phone,

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
// PROVIDER ANALYTICS
// GET /paylater/providers
// ==========================================================

const getProviderAnalytics = async ({
    merchantId = null,
    startDate = null,
    endDate = null
}) => {

    const connection = await db.getConnection();

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

            PAYLATER_QUERIES
                .GET_PAYLATER_PROVIDER_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            providerName:
                row.provider_name,

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
// DUE DATE ANALYTICS
// GET /paylater/due-dates
// ==========================================================

const getDueDateAnalytics = async ({
    merchantId = null,
    startDate = null,
    endDate = null
}) => {

    const connection = await db.getConnection();

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

            PAYLATER_QUERIES
                .GET_PAYLATER_DUE_DATE_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            dueDate:
                row.due_date,

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
                ),

            overdueTransactions:
                Number(
                    row.overdue_transactions || 0
                ),

            upcomingTransactions:
                Number(
                    row.upcoming_transactions || 0
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// MERCHANT PAY LATER ANALYTICS
// GET /paylater/merchant
// ==========================================================

const getMerchantPayLaterAnalytics = async ({
    merchantId = null,
    startDate = null,
    endDate = null
}) => {

    const connection = await db.getConnection();

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

            PAYLATER_QUERIES
                .GET_MERCHANT_PAYLATER_ANALYTICS,

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

            revenue:
                Number(
                    row.revenue || 0
                ),

            transactionsWithDueDate:
                Number(
                    row.transactions_with_due_date || 0
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// DAILY PAY LATER ANALYTICS
// GET /paylater/daily
// ==========================================================

const getDailyPayLaterAnalytics = async ({
    merchantId = null,
    startDate = null,
    endDate = null
}) => {

    const connection = await db.getConnection();

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

            PAYLATER_QUERIES
                .GET_DAILY_PAYLATER_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            reportDate:
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

            cancelledTransactions:
                Number(
                    row.cancelled_transactions || 0
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
// UPCOMING DUE PAYMENTS
// GET /paylater/upcoming-due
// ==========================================================

const getUpcomingDuePayments = async ({
    merchantId = null,
    limit = 20
}) => {

    const connection = await db.getConnection();

    try {

        const currentLimit =
            Number(limit) > 0
                ? Math.min(Number(limit), 100)
                : 20;

        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;


        const [
            rows
        ] = await connection.query(

            PAYLATER_QUERIES
                .GET_UPCOMING_PAYLATER_DUE,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                currentLimit

            ]

        );


        return {

            count:
                rows.length,

            upcomingDue:
                rows.map(row => ({

                    transactionPayLaterId:
                        row.transaction_paylater_id,

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

                    providerName:
                        row.provider_name,

                    loanReference:
                        row.loan_reference,

                    dueDate:
                        row.due_date,

                    payLaterGatewayReference:
                        row.paylater_gateway_reference,

                    customerName:
                        row.customer_name,

                    customerEmail:
                        row.customer_email,

                    customerPhone:
                        row.customer_phone,

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

                    daysUntilDue:
                        Number(
                            row.days_until_due || 0
                        ),

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
// EXPORT
// ==========================================================

module.exports = {

    getPayLaterTransactions,

    getPayLaterSummary,

    getRecentPayLaterTransactions,

    getProviderAnalytics,

    getDueDateAnalytics,

    getMerchantPayLaterAnalytics,

    getDailyPayLaterAnalytics,

    getUpcomingDuePayments

};