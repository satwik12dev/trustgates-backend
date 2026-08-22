const db = require("../../config/pool");

const REFUND_QUERIES =
    require("../../utils/admin/refundQueries");


// ==========================================================
// REFUND LIST
// ==========================================================

const getRefunds = async ({
    merchantId = null,
    refundStatus = null,
    refundType = null,
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
        // Normalize Filters
        // ==================================================

        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;

        const normalizedStatus =
            refundStatus || null;

        const normalizedType =
            refundType || null;

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
        // Execute Query
        // ==================================================
        const [
    rows
] = await connection.query(

    REFUND_QUERIES.GET_REFUNDS,

    [

        normalizedMerchantId,
        normalizedMerchantId,

        normalizedStatus,
        normalizedStatus,

        normalizedType,
        normalizedType,

        normalizedStartDate,
        normalizedStartDate,

        normalizedEndDate,
        normalizedEndDate,

        normalizedSearch,

        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue

    ]

);
        // ==================================================
        // Response Mapping
        // ==================================================

        const refunds =
            rows.map((row) => ({

                refundId:
                    row.refund_id,

                refundReference:
                    row.refund_reference,

                requestId:
                    row.request_id,

                merchantId:
                    row.merchant_id,

                businessName:
                    row.business_name,

                transactionId:
                    row.transaction_id,

                transactionRef:
                    row.transaction_ref,

                orderId:
                    row.order_id,

                gatewayRefundId:
                    row.gateway_refund_id,

                gatewayPaymentId:
                    row.gateway_payment_id,

                gatewayOrderId:
                    row.gateway_order_id,

                amount:
                    Number(row.amount),

                feeAmount:
                    Number(row.fee_amount),

                totalDebitAmount:
                    Number(row.total_debit_amount),

                currency:
                    row.currency,

                refundType:
                    row.refund_type,

                refundStatus:
                    row.refund_status,

                refundReason:
                    row.refund_reason,

                completionSource:
                    row.completion_source,

                failureCode:
                    row.failure_code,

                failureMessage:
                    row.failure_message,

                processedAt:
                    row.processed_at,

                createdAt:
                    row.created_at,

                updatedAt:
                    row.updated_at

            }));


        return {

            page:
                currentPage,

            limit:
                currentLimit,

            count:
                refunds.length,

            refunds

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// REFUND SUMMARY
// ==========================================================

const getRefundSummary = async ({
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const normalizedMerchantId =
            merchantId !== null &&
            merchantId !== undefined &&
            merchantId !== ""
                ? Number(merchantId)
                : null;


        const [
            rows
        ] = await connection.query(

            REFUND_QUERIES.GET_REFUND_SUMMARY,

            [
                normalizedMerchantId,
                normalizedMerchantId,
                startDate,
                endDate
            ]

        );


        const row =
            rows[0] || {};


        return {

            totalRefunds:
                Number(
                    row.total_refunds || 0
                ),

            processedRefunds:
                Number(
                    row.processed_refunds || 0
                ),

            failedRefunds:
                Number(
                    row.failed_refunds || 0
                ),

            pendingRefunds:
                Number(
                    row.pending_refunds || 0
                ),

            refundAmount:
                Number(
                    row.refund_amount || 0
                ),

            refundFees:
                Number(
                    row.refund_fees || 0
                ),

            totalDebitAmount:
                Number(
                    row.total_debit_amount || 0
                )

        };

    } finally {

        connection.release();

    }

};

// ==========================================================
// RECENT REFUNDS
// ==========================================================

const getRecentRefunds = async ({
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

            REFUND_QUERIES
                .GET_RECENT_REFUNDS,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                currentLimit

            ]

        );


        const refunds =
            rows.map((row) => ({

                refundId:
                    row.refund_id,

                refundReference:
                    row.refund_reference,

                merchantId:
                    row.merchant_id,

                businessName:
                    row.business_name,

                transactionId:
                    row.transaction_id,

                transactionRef:
                    row.transaction_ref,

                orderId:
                    row.order_id,

                amount:
                    Number(row.amount),

                feeAmount:
                    Number(row.fee_amount),

                totalDebitAmount:
                    Number(row.total_debit_amount),

                currency:
                    row.currency,

                refundType:
                    row.refund_type,

                refundStatus:
                    row.refund_status,

                refundReason:
                    row.refund_reason,

                processedAt:
                    row.processed_at,

                createdAt:
                    row.created_at

            }));


        return {

            count:
                refunds.length,

            refunds

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// REFUND ANALYTICS
// ==========================================================

const getRefundAnalytics = async ({
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;


        const [
            rows
        ] = await connection.query(

            REFUND_QUERIES
                .GET_REFUND_ANALYTICS,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                startDate,
                endDate

            ]

        );


        return rows.map((row) => ({

            date:
                row.report_date,

            totalRefunds:
                Number(
                    row.total_refunds || 0
                ),

            processedRefunds:
                Number(
                    row.processed_refunds || 0
                ),

            failedRefunds:
                Number(
                    row.failed_refunds || 0
                ),

            pendingRefunds:
                Number(
                    row.pending_refunds || 0
                ),

            refundAmount:
                Number(
                    row.refund_amount || 0
                ),

            refundFees:
                Number(
                    row.refund_fees || 0
                ),

            totalDebitAmount:
                Number(
                    row.total_debit_amount || 0
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// MERCHANT REFUND ANALYTICS
// ==========================================================

const getMerchantRefundAnalytics = async ({
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;


        const [
            rows
        ] = await connection.query(

            REFUND_QUERIES
                .GET_MERCHANT_REFUND_ANALYTICS,

            [

                startDate,
                endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map((row) => ({

            merchantId:
                row.merchant_id,

            businessName:
                row.business_name,

            totalRefunds:
                Number(
                    row.total_refunds || 0
                ),

            processedRefunds:
                Number(
                    row.processed_refunds || 0
                ),

            failedRefunds:
                Number(
                    row.failed_refunds || 0
                ),

            pendingRefunds:
                Number(
                    row.pending_refunds || 0
                ),

            refundAmount:
                Number(
                    row.refund_amount || 0
                ),

            refundFees:
                Number(
                    row.refund_fees || 0
                ),

            totalDebitAmount:
                Number(
                    row.total_debit_amount || 0
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// REFUND STATUS ANALYTICS
// ==========================================================

const getRefundStatusAnalytics = async ({
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const normalizedMerchantId =
            merchantId
                ? Number(merchantId)
                : null;


        const [
            rows
        ] = await connection.query(

            REFUND_QUERIES
                .GET_REFUND_STATUS_ANALYTICS,

            [

                startDate,
                endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map((row) => ({

            status:
                row.refund_status,

            totalRefunds:
                Number(
                    row.total_refunds || 0
                ),

            refundAmount:
                Number(
                    row.refund_amount || 0
                ),

            refundFees:
                Number(
                    row.refund_fees || 0
                ),

            totalDebitAmount:
                Number(
                    row.total_debit_amount || 0
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

    getRefunds,

    getRefundSummary,

    getRecentRefunds,

    getRefundAnalytics,

    getMerchantRefundAnalytics,

    getRefundStatusAnalytics

};