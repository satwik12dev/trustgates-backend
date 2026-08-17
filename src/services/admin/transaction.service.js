// src/services/admin/transaction.service.js

const {
    getRecentTransactions
} = require("../../utils/admin/dashboardQueries");


/**
 * Get Recent Transactions
 */
const getTransactionList = async (
    filters = {},
    limit = 20
) => {

    return await getRecentTransactions(
        filters,
        limit
    );

};


/**
 * Get Latest Transactions
 */
const getLatestTransactions = async (
    filters = {}
) => {

    return await getRecentTransactions(
        filters,
        10
    );

};


/**
 * Get Dashboard Transactions
 */
const getDashboardTransactions = async (
    filters = {},
    limit = 10
) => {

    const transactions = await getRecentTransactions(
        filters,
        limit
    );

    return {

        total: transactions.length,

        transactions

    };

};


module.exports = {

    getTransactionList,
    getLatestTransactions,
    getDashboardTransactions

};