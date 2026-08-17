// src/controllers/admin/transaction.controller.js

const transactionValidation = require("../../validations/admin/transaction.validation");

const {
    getTransactionList,
    getLatestTransactions,
    getDashboardTransactions
} = require("../../services/admin/transaction.service");


/**
 * Transaction List
 */
const transactionList = async (req, res, next) => {

    try {

        const { error, value } = transactionValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getTransactionList(value);

        return res.status(200).json({

            success: true,

            message: "Transactions fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


/**
 * Latest Transactions
 */
const latestTransactions = async (req, res, next) => {

    try {

        const { error, value } = transactionValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getLatestTransactions(value);

        return res.status(200).json({

            success: true,

            message: "Latest transactions fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


/**
 * Dashboard Transactions
 */
const dashboardTransactions = async (req, res, next) => {

    try {

        const { error, value } = transactionValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getDashboardTransactions(value);

        return res.status(200).json({

            success: true,

            message: "Dashboard transactions fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


module.exports = {

    transactionList,

    latestTransactions,

    dashboardTransactions

};