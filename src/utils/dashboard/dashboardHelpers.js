// src/utils/dashboard/dashboardHelpers.js

/**
 * Calculate Success Rate
 * @param {number} successfulTransactions
 * @param {number} totalTransactions
 * @returns {number}
 */
const calculateSuccessRate = (
    successfulTransactions = 0,
    totalTransactions = 0
) => {

    successfulTransactions = Number(successfulTransactions);
    totalTransactions = Number(totalTransactions);

    if (totalTransactions === 0) {
        return 0;
    }

    return Number(
        (
            (successfulTransactions / totalTransactions) * 100
        ).toFixed(2)
    );

};

/**
 * Format Currency
 * @param {number|string} amount
 * @returns {string}
 */
const formatCurrency = (amount = 0) => {

    return Number(amount || 0).toFixed(2);

};

/**
 * Format Number
 * @param {number|string} value
 * @returns {number}
 */
const formatNumber = (value = 0) => {

    return Number(value || 0);

};

/**
 * Convert MySQL result to array
 * @param {*} rows
 * @returns {Array}
 */
const safeArray = (rows) => {

    return Array.isArray(rows) ? rows : [];

};

/**
 * Build Dashboard Summary Response
 */
const buildDashboardSummary = (
    summary,
    availableBalance,
    settledAmount
) => {

    return {

        total_transactions:
            formatNumber(summary.total_transactions),

        successful_transactions:
            formatNumber(summary.successful_transactions),

        failed_transactions:
            formatNumber(summary.failed_transactions),

        pending_transactions:
            formatNumber(summary.pending_transactions),

        chargebacks:
            formatNumber(summary.chargebacks),

        success_rate:
            calculateSuccessRate(
                summary.successful_transactions,
                summary.total_transactions
            ),

        available_balance:
            formatCurrency(availableBalance),

        settled_amount:
            formatCurrency(settledAmount),

        currency: "INR"

    };

};

/**
 * Build Payment Analytics Response
 */
const buildPaymentAnalytics = ({
    paymentMethods,
    paymentStatus,
    revenueTrend,
    transactionTrend,
    totalRevenue,
    successfulRevenue,
    failedRevenue,
    averageTransactionAmount,
    topPaymentMethod,
    successRate
}) => {

    return {

        total_revenue:
            formatCurrency(totalRevenue),

        successful_revenue:
            formatCurrency(successfulRevenue),

        failed_revenue:
            formatCurrency(failedRevenue),

        average_transaction_amount:
            formatCurrency(averageTransactionAmount),

        success_rate:
            successRate,

        top_payment_method:
            topPaymentMethod || null,

        payment_method_distribution:
            safeArray(paymentMethods),

        payment_status_distribution:
            safeArray(paymentStatus),

        revenue_trend:
            safeArray(revenueTrend),

        transaction_trend:
            safeArray(transactionTrend)

    };

};

/**
 * Build Pagination Object
 */
const buildPagination = (
    page,
    limit,
    totalRecords
) => {

    page = Number(page);
    limit = Number(limit);
    totalRecords = Number(totalRecords);

    return {

        page,

        limit,

        total_records: totalRecords,

        total_pages:
            Math.ceil(totalRecords / limit)

    };

};

module.exports = {

    calculateSuccessRate,

    formatCurrency,

    formatNumber,

    safeArray,

    buildDashboardSummary,

    buildPaymentAnalytics,

    buildPagination

};