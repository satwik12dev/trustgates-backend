// ==========================================================
// Admin Wallet Analytics Helper
// ==========================================================

const QUERIES =
    require(
        "../../../queries/adminWallet/adminWalletAnalytics.query"
    );


// ==========================================================
// Get Admin Wallet
// ==========================================================

const getAdminWallet = async (
    connection
) => {

    const [rows] =
        await connection.query(
            QUERIES.WALLET
        );

    return rows[0] || null;
};


// ==========================================================
// Get Wallet Summary
// ==========================================================

const getAdminWalletSummary = async (
    connection,
    dateFrom,
    dateTo
) => {

    const [rows] =
        await connection.query(
            QUERIES.SUMMARY,
            [
                dateFrom,
                dateTo
            ]
        );

    return rows[0] || {
        total_credits: 0,
        total_debits: 0,
        completed_transactions: 0,
        pending_transactions: 0,
        failed_transactions: 0,
        reversed_transactions: 0
    };
};


// ==========================================================
// Get Fee Revenue
// ==========================================================

const getFeeRevenue = async (
    connection,
    dateFrom,
    dateTo
) => {

    const [rows] =
        await connection.query(
            QUERIES.FEE_REVENUE,
            [
                dateFrom,
                dateTo
            ]
        );

    return rows[0] || {
        total_fee_revenue: 0,
        fee_transaction_count: 0,
        average_fee: 0
    };
};


// ==========================================================
// Get Revenue By Source
// ==========================================================

const getSourceRevenue = async (
    connection,
    dateFrom,
    dateTo
) => {

    const [rows] =
        await connection.query(
            QUERIES.SOURCE_REVENUE,
            [
                dateFrom,
                dateTo
            ]
        );

    return rows;
};


// ==========================================================
// Get Revenue By Merchant
// ==========================================================

const getMerchantRevenue = async (
    connection,
    dateFrom,
    dateTo
) => {

    const [rows] =
        await connection.query(
            QUERIES.MERCHANT_REVENUE,
            [
                dateFrom,
                dateTo
            ]
        );

    return rows;
};


// ==========================================================
// Get Refund Fee Analytics
// ==========================================================

const getRefundFeeAnalytics = async (
    connection,
    dateFrom,
    dateTo
) => {

    const [rows] =
        await connection.query(
            QUERIES.REFUND_FEES,
            [
                dateFrom,
                dateTo
            ]
        );

    return rows[0] || {
        refund_fee_revenue: 0,
        refund_fee_transactions: 0,
        average_refund_fee: 0
    };
};


// ==========================================================
// Get Daily Revenue
// ==========================================================

const getDailyRevenue = async (
    connection,
    dateFrom,
    dateTo
) => {

    const [rows] =
        await connection.query(
            QUERIES.DAILY_REVENUE,
            [
                dateFrom,
                dateTo
            ]
        );

    return rows;
};


// ==========================================================
// Get Recent Transactions
// ==========================================================

const getRecentTransactions = async (
    connection,
    limit = 20
) => {

    const safeLimit =
        Math.min(
            Math.max(
                Number(limit) || 20,
                1
            ),
            100
        );

    const [rows] =
        await connection.query(
            QUERIES.RECENT_TRANSACTIONS,
            [
                safeLimit
            ]
        );

    return rows;
};


// ==========================================================
// Get Reconciliation
// ==========================================================

const getReconciliation = async (
    connection
) => {

    const [rows] =
        await connection.query(
            QUERIES.RECONCILIATION
        );

    return rows[0] || {
        total_credits: 0,
        total_debits: 0
    };
};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    getAdminWallet,
    getAdminWalletSummary,
    getFeeRevenue,
    getSourceRevenue,
    getMerchantRevenue,
    getRefundFeeAnalytics,
    getDailyRevenue,
    getRecentTransactions,
    getReconciliation

};