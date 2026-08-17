// src/services/dashboard/recentTransactions.service.js

const db = require("../../config/pool");

const DASHBOARD_QUERIES = require("../../utils/dashboard/dashboardQueries");

const {
    buildDashboardFilters
} = require("../../utils/dashboard/dashboardFilterBuilder");

const {
    buildPagination
} = require("../../utils/dashboard/dashboardHelpers");

/**
 * Get Recent Transactions
 */
const getRecentTransactions = async (
    merchantId,
    filters
) => {

    const connection = await db.getConnection();

    try {

        const {
            whereClause,
            params
        } = buildDashboardFilters(filters);

        const page = Number(filters.page || 1);

        const limit = Number(filters.limit || 20);

        const offset = (page - 1) * limit;

        const sortBy = filters.sort_by || "created_at";

        const sortOrder = filters.sort_order || "DESC";
        // ==========================================
        // Fetch Transactions
        // ==========================================

        let transactionQuery =
            DASHBOARD_QUERIES.GET_RECENT_TRANSACTIONS;

        transactionQuery += whereClause;

        transactionQuery += `

            ORDER BY ${sortBy} ${sortOrder}

            LIMIT ?

            OFFSET ?

        `;

        const [transactions] =
            await connection.query(
                transactionQuery,
                [
                    merchantId,
                    ...params,
                    limit,
                    offset
                ]
            );

        // ==========================================
        // Count Total Records
        // ==========================================

        let countQuery =
            DASHBOARD_QUERIES.GET_RECENT_TRANSACTIONS_COUNT;

        countQuery += whereClause;

        const [countResult] =
            await connection.query(
                countQuery,
                [
                    merchantId,
                    ...params
                ]
            );

        const totalRecords =
            Number(
                countResult[0]?.total_records || 0
            );

        return {
            pagination: buildPagination(
                page,
                limit,
                totalRecords
            ),
            transactions
        };
    } catch (error) {
        console.error(
            "Recent Transactions Service Error:",
            error
        );
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getRecentTransactions
};