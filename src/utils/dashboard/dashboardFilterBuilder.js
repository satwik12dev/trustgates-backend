// src/utils/dashboard/dashboardFilterBuilder.js

/**
 * Build Dynamic Dashboard Filters
 * Used by:
 * - Payment Analytics
 * - Recent Transactions
 * - Settlement Summary
 * - Refund Summary
 */

const buildDashboardFilters = (filters = {}) => {

    let whereClause = "";
    const params = [];

    const {
        payment_method,
        status,
        settlement_status,
        refund_status,
        search,
        period,
        start_date,
        end_date
    } = filters;

    // ==========================================
    // Payment Method
    // ==========================================

    if (
        payment_method &&
        payment_method !== "ALL"
    ) {

        whereClause += " AND payment_method = ?";
        params.push(payment_method);

    }

    // ==========================================
    // Transaction Status
    // ==========================================

    if (
        status &&
        status !== "ALL"
    ) {

        whereClause += " AND status = ?";
        params.push(status);

    }

    // ==========================================
    // Settlement Status
    // ==========================================

    if (
        settlement_status &&
        settlement_status !== "ALL"
    ) {

        whereClause += " AND settlement_status = ?";
        params.push(settlement_status);

    }

    // ==========================================
    // Refund Status
    // ==========================================

    if (
        refund_status &&
        refund_status !== "ALL"
    ) {

        whereClause += " AND refund_status = ?";
        params.push(refund_status);

    }

    // ==========================================
    // Search
    // ==========================================

    if (
        search &&
        search.trim() !== ""
    ) {

        whereClause += `
            AND (
                transaction_id LIKE ?
                OR order_id LIKE ?
                OR customer_name LIKE ?
                OR customer_email LIKE ?
            )
        `;

        const keyword = `%${search}%`;

        params.push(
            keyword,
            keyword,
            keyword,
            keyword
        );

    }

    // ==========================================
    // Quick Period Filters
    // ==========================================

    switch (period) {

        case "today":

            whereClause += `
                AND DATE(created_at)=CURDATE()
            `;
            break;

        case "yesterday":

            whereClause += `
                AND DATE(created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY)
            `;
            break;

        case "last_7_days":

            whereClause += `
                AND created_at>=DATE_SUB(NOW(),INTERVAL 7 DAY)
            `;
            break;

        case "last_30_days":

            whereClause += `
                AND created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY)
            `;
            break;

        case "last_90_days":

            whereClause += `
                AND created_at>=DATE_SUB(NOW(),INTERVAL 90 DAY)
            `;
            break;

        case "this_month":

            whereClause += `
                AND YEAR(created_at)=YEAR(CURDATE())
                AND MONTH(created_at)=MONTH(CURDATE())
            `;
            break;

        case "last_month":

            whereClause += `
                AND YEAR(created_at)=YEAR(DATE_SUB(CURDATE(),INTERVAL 1 MONTH))
                AND MONTH(created_at)=MONTH(DATE_SUB(CURDATE(),INTERVAL 1 MONTH))
            `;
            break;

        case "this_year":

            whereClause += `
                AND YEAR(created_at)=YEAR(CURDATE())
            `;
            break;

    }

    // ==========================================
    // Custom Date Range
    // ==========================================

    if (start_date) {

        whereClause += " AND DATE(created_at) >= ?";
        params.push(start_date);

    }

    if (end_date) {

        whereClause += " AND DATE(created_at) <= ?";
        params.push(end_date);

    }

    return {

        whereClause,
        params

    };

};

module.exports = {
    buildDashboardFilters
};