const db = require("../../config/pool");

const EMI_QUERIES =
    require("../../utils/admin/emiQueries");


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
// EMI DASHBOARD
// GET /emi
// ==========================================================

const getEmiTransactions = async ({

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

            EMI_QUERIES
                .GET_EMI_TRANSACTIONS,

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
                searchValue

            ]

        );


        const totalRecords =
            rows.length;

        const emiTransactions =
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
                emiTransactions.length,

            totalPages:
                Math.ceil(
                    totalRecords /
                    currentLimit
                ),

            emi:
                emiTransactions.map(row => ({

                    transactionEmiId:
                        row.transaction_emi_id,

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

                    // EMI
                    issuer:
                        row.issuer,

                    tenure:
                        row.tenure !== null
                            ? Number(row.tenure)
                            : null,

                    interestRate:
                        row.interest_rate !== null
                            ? Number(row.interest_rate)
                            : null,

                    emiGatewayReference:
                        row.emi_gateway_reference,

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

                    emiCreatedAt:
                        row.emi_created_at,

                    emiUpdatedAt:
                        row.emi_updated_at

                }))

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// EMI SUMMARY
// GET /emi/summary
// ==========================================================

const getEmiSummary = async ({

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

            EMI_QUERIES
                .GET_EMI_SUMMARY,

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

            averageInterestRate:
                Number(
                    row.average_interest_rate || 0
                ),

            averageTenure:
                Number(
                    row.average_tenure || 0
                )

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// RECENT EMI TRANSACTIONS
// GET /emi/recent
// ==========================================================

const getRecentEmiTransactions = async ({

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

            EMI_QUERIES
                .GET_RECENT_EMI_TRANSACTIONS,

            [

                normalizedMerchantId,
                normalizedMerchantId,

                currentLimit

            ]

        );


        return {

            count:
                rows.length,

            emi:
                rows.map(row => ({

                    transactionEmiId:
                        row.transaction_emi_id,

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

                    issuer:
                        row.issuer,

                    tenure:
                        row.tenure !== null
                            ? Number(row.tenure)
                            : null,

                    interestRate:
                        row.interest_rate !== null
                            ? Number(row.interest_rate)
                            : null,

                    emiGatewayReference:
                        row.emi_gateway_reference,

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
// EMI BANK / ISSUER ANALYTICS
// GET /emi/banks
// ==========================================================

const getEmiBankAnalytics = async ({

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

            EMI_QUERIES
                .GET_EMI_BANK_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            issuer:
                row.issuer,

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
// EMI CARD NETWORK ANALYTICS
// GET /emi/card-networks
// ==========================================================

const getEmiCardNetworkAnalytics = async ({

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

            EMI_QUERIES
                .GET_EMI_CARD_NETWORK_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            cardNetwork:
                row.card_network,

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
// EMI TENURE ANALYTICS
// GET /emi/tenures
// ==========================================================

const getEmiTenureAnalytics = async ({

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

            EMI_QUERIES
                .GET_EMI_TENURE_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            tenure:
                row.tenure !== null
                    ? Number(row.tenure)
                    : null,

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

            averageInterestRate:
                Number(
                    row.average_interest_rate || 0
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// MERCHANT EMI ANALYTICS
// GET /emi/merchant
// ==========================================================

const getMerchantEmiAnalytics = async ({

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

            EMI_QUERIES
                .GET_MERCHANT_EMI_ANALYTICS,

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
                ),

            averageTenure:
                Number(
                    row.average_tenure || 0
                ),

            averageInterestRate:
                Number(
                    row.average_interest_rate || 0
                )

        }));

    } finally {

        connection.release();

    }

};


// ==========================================================
// INTEREST RATE ANALYTICS
// GET /emi/interest-rates
// ==========================================================

const getInterestRateAnalytics = async ({

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

            EMI_QUERIES
                .GET_EMI_INTEREST_RATE_ANALYTICS,

            [

                range.startDate,
                range.endDate,

                normalizedMerchantId,
                normalizedMerchantId

            ]

        );


        return rows.map(row => ({

            interestRate:
                row.interest_rate !== null
                    ? Number(row.interest_rate)
                    : null,

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

            averageTenure:
                Number(
                    row.average_tenure || 0
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

    getEmiTransactions,

    getEmiSummary,

    getRecentEmiTransactions,

    getEmiBankAnalytics,

    getEmiCardNetworkAnalytics,

    getEmiTenureAnalytics,

    getMerchantEmiAnalytics,

    getInterestRateAnalytics

};