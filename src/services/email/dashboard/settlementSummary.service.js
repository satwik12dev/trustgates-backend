// src/services/dashboard/settlementSummary.service.js

const db = require("../../config/pool");

const DASHBOARD_QUERIES = require("../../utils/dashboard/dashboardQueries");

const {
    buildDashboardFilters
} = require("../../utils/dashboard/dashboardFilterBuilder");

const {
    buildPagination
} = require("../../utils/dashboard/dashboardHelpers");

/**
 * Get Settlement Summary
 */
const getSettlementSummary = async (
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

        const limit = Number(filters.limit || 10);

        const offset = (page - 1) * limit;

        // ==========================================
        // Safe Sorting
        // ==========================================

        const allowedSortFields = {
            settlement_date: "settlement_date",
            net_amount: "net_amount",
            created_at: "created_at"
        };

        const sortBy =
            allowedSortFields[filters.sort_by] ||
            "settlement_date";

        const sortOrder =
            filters.sort_order === "ASC"
                ? "ASC"
                : "DESC";

        // ==========================================
        // Settlement Query
        // ==========================================

        let settlementQuery =
            DASHBOARD_QUERIES.GET_SETTLEMENT_SUMMARY;

        settlementQuery += whereClause;

        settlementQuery += `

            ORDER BY ${sortBy} ${sortOrder}

            LIMIT ?

            OFFSET ?

        `;

        const [settlements] =
            await connection.query(
                settlementQuery,
                [
                    merchantId,
                    ...params,
                    limit,
                    offset
                ]
            );

        // ==========================================
        // Count Query
        // ==========================================

        let countQuery =
            DASHBOARD_QUERIES.GET_SETTLEMENT_SUMMARY_COUNT;

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

            settlements

        };

    } catch (error) {

        console.error(
            "Settlement Summary Service Error:",
            error
        );

        throw error;

    } finally {

        connection.release();

    }

};

module.exports = {
    getSettlementSummary
};