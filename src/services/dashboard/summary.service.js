// src/services/dashboard/summary.service.js

const db = require("../../config/pool");
const DASHBOARD_QUERIES = require("../../utils/dashboard/dashboardQueries");
const {
    buildDashboardSummary
} = require("../../utils/dashboard/dashboardHelpers");

const getDashboardSummary = async (merchantId) => {

    const connection = await db.getConnection();

    try {

        // ===============================
        // Dashboard Summary
        // ===============================

        const [summaryResult] = await connection.query(
            DASHBOARD_QUERIES.GET_DASHBOARD_SUMMARY,
            [merchantId]
        );

        // ===============================
        // Available Balance
        // ===============================

        const [availableBalanceResult] = await connection.query(
            DASHBOARD_QUERIES.GET_AVAILABLE_BALANCE,
            [merchantId]
        );

        // ===============================
        // Settled Amount
        // ===============================

        const [settledAmountResult] = await connection.query(
            DASHBOARD_QUERIES.GET_SETTLED_AMOUNT,
            [merchantId]
        );

        const summary = summaryResult[0] || {};

        const availableBalance =
            availableBalanceResult[0]?.available_balance || 0;

        const settledAmount =
            settledAmountResult[0]?.settled_amount || 0;

        return buildDashboardSummary(
            summary,
            availableBalance,
            settledAmount
        );

    } catch (error) {

        throw error;

    } finally {

        connection.release();

    }

};

module.exports = {
    getDashboardSummary
};