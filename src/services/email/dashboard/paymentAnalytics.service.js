// src/services/dashboard/paymentAnalytics.service.js

const db = require("../../config/pool");

const DASHBOARD_QUERIES = require("../../utils/dashboard/dashboardQueries");

const {
    buildDashboardFilters
} = require("../../utils/dashboard/dashboardFilterBuilder");

const {
    calculateSuccessRate,
    buildPaymentAnalytics
} = require("../../utils/dashboard/dashboardHelpers");

/**
 * Payment Analytics Service
 */
const getPaymentAnalytics = async (
    merchantId,
    filters
) => {

    const connection = await db.getConnection();

    try {

        // ==========================================
        // Build Dynamic Filters
        // ==========================================

        const {
            whereClause,
            params
        } = buildDashboardFilters(filters);

        // ==========================================
        // Payment Method Distribution
        // ==========================================

        let paymentMethodQuery =
            DASHBOARD_QUERIES.GET_PAYMENT_METHOD_DISTRIBUTION;

        paymentMethodQuery += whereClause;

        paymentMethodQuery += `
            GROUP BY payment_method
            ORDER BY total_amount DESC
        `;

        const [paymentMethods] =
            await connection.query(
                paymentMethodQuery,
                [
                    merchantId,
                    ...params
                ]
            );

        // ==========================================
        // Payment Status Distribution
        // ==========================================

        let paymentStatusQuery =
            DASHBOARD_QUERIES.GET_PAYMENT_STATUS_ANALYTICS;

        paymentStatusQuery += whereClause;

        paymentStatusQuery += `
            GROUP BY status
            ORDER BY total_transactions DESC
        `;

        const [paymentStatus] =
            await connection.query(
                paymentStatusQuery,
                [
                    merchantId,
                    ...params
                ]
            );

        // ==========================================
        // Total Revenue
        // ==========================================

        let totalRevenueQuery =
            DASHBOARD_QUERIES.GET_TOTAL_REVENUE;

        totalRevenueQuery += whereClause;

        const [totalRevenueResult] =
            await connection.query(
                totalRevenueQuery,
                [
                    merchantId,
                    ...params
                ]
            );

        // ==========================================
        // Successful Revenue
        // ==========================================

        let successfulRevenueQuery =
            DASHBOARD_QUERIES.GET_SUCCESSFUL_REVENUE;

        successfulRevenueQuery += whereClause;

        const [successfulRevenueResult] =
            await connection.query(
                successfulRevenueQuery,
                [
                    merchantId,
                    ...params
                ]
            );

        // ==========================================
        // Failed Revenue
        // ==========================================

        let failedRevenueQuery =
            DASHBOARD_QUERIES.GET_FAILED_REVENUE;

        failedRevenueQuery += whereClause;

        const [failedRevenueResult] =
            await connection.query(
                failedRevenueQuery,
                [
                    merchantId,
                    ...params
                ]
            );
                // ==========================================
        // Revenue Trend
        // ==========================================

        let revenueTrendQuery =
            DASHBOARD_QUERIES.GET_REVENUE_TREND;

        revenueTrendQuery += whereClause;

        revenueTrendQuery += `
            GROUP BY DATE(created_at)
            ORDER BY transaction_date ASC
        `;

        const [revenueTrend] =
            await connection.query(
                revenueTrendQuery,
                [
                    merchantId,
                    ...params
                ]
            );

        // ==========================================
        // Transaction Trend
        // ==========================================

        let transactionTrendQuery =
            DASHBOARD_QUERIES.GET_TRANSACTION_TREND;

        transactionTrendQuery += whereClause;

        transactionTrendQuery += `
            GROUP BY DATE(created_at)
            ORDER BY transaction_date ASC
        `;

        const [transactionTrend] =
            await connection.query(
                transactionTrendQuery,
                [
                    merchantId,
                    ...params
                ]
            );

        // ==========================================
        // Payment Success Rate
        // ==========================================

        let successRateQuery =
            DASHBOARD_QUERIES.GET_PAYMENT_SUCCESS_RATE;

        successRateQuery += whereClause;

        const [successRateResult] =
            await connection.query(
                successRateQuery,
                [
                    merchantId,
                    ...params
                ]
            );

        const totalTransactions =
            Number(
                successRateResult[0]?.total_transactions || 0
            );

        const successfulTransactions =
            Number(
                successRateResult[0]?.successful_transactions || 0
            );

        const successRate =
            calculateSuccessRate(
                successfulTransactions,
                totalTransactions
            );

        // ==========================================
        // Average Transaction Amount
        // ==========================================

        let averageTransactionQuery =
            DASHBOARD_QUERIES.GET_AVERAGE_TRANSACTION_AMOUNT;

        averageTransactionQuery += whereClause;

        const [averageTransactionResult] =
            await connection.query(
                averageTransactionQuery,
                [
                    merchantId,
                    ...params
                ]
            );

        // ==========================================
        // Top Payment Method
        // ==========================================

        let topPaymentMethodQuery =
            DASHBOARD_QUERIES.GET_TOP_PAYMENT_METHOD;

        topPaymentMethodQuery += whereClause;

        topPaymentMethodQuery += `
            GROUP BY payment_method
            ORDER BY total_transactions DESC
            LIMIT 1
        `;

        const [topPaymentMethodResult] =
            await connection.query(
                topPaymentMethodQuery,
                [
                    merchantId,
                    ...params
                ]
            );
                // ==========================================
        // Prepare Analytics Response
        // ==========================================

        const analytics = buildPaymentAnalytics({

            paymentMethods,

            paymentStatus,

            revenueTrend,

            transactionTrend,

            totalRevenue:
                totalRevenueResult[0]?.total_revenue || 0,

            successfulRevenue:
                successfulRevenueResult[0]?.successful_revenue || 0,

            failedRevenue:
                failedRevenueResult[0]?.failed_revenue || 0,

            averageTransactionAmount:
                averageTransactionResult[0]?.average_transaction_amount || 0,

            topPaymentMethod:
                topPaymentMethodResult.length > 0
                    ? topPaymentMethodResult[0].payment_method
                    : null,

            successRate

        });

        return analytics;

    } catch (error) {

        console.error(
            "Payment Analytics Service Error:",
            error
        );

        throw error;

    } finally {

        connection.release();

    }

};

module.exports = {
    getPaymentAnalytics
};