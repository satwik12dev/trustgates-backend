// src/services/dashboard/refundSummary.service.js

const db = require("../../config/pool");

const DASHBOARD_QUERIES = require("../../utils/dashboard/dashboardQueries");

const {
    buildDashboardFilters
} = require("../../utils/dashboard/dashboardFilterBuilder");

const {
    buildPagination
} = require("../../utils/dashboard/dashboardHelpers");

/**
 * Get Refund Summary
 */
const getRefundSummary = async (
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
            refunded_at: "refunded_at",
            refund_amount: "refund_amount",
            created_at: "created_at"
        };

        const sortBy =
            allowedSortFields[filters.sort_by] ||
            "refunded_at";

        const sortOrder =
            filters.sort_order === "ASC"
                ? "ASC"
                : "DESC";

        // ==========================================
        // Refund Query
        // ==========================================

        let refundQuery =
            DASHBOARD_QUERIES.GET_REFUND_SUMMARY;

        refundQuery += whereClause;

        refundQuery += `

            ORDER BY ${sortBy} ${sortOrder}

            LIMIT ?

            OFFSET ?

        `;

        const [refunds] =
            await connection.query(
                refundQuery,
                [
                    merchantId,
                    ...params,
                    limit,
                    offset
                ]
            );

        // ==========================================
        // Refund Count
        // ==========================================

        let countQuery =
            DASHBOARD_QUERIES.GET_REFUND_SUMMARY_COUNT;

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

            refunds

        };

    } catch (error) {

        console.error(
            "Refund Summary Service Error:",
            error
        );

        throw error;

    } finally {

        connection.release();

    }

};

module.exports = {
    getRefundSummary
};