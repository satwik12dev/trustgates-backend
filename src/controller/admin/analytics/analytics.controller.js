const dashboardValidation = require("../../../validations/admin/dashboard.validation");

const {
    getDashboardAnalytics,
    getTransactionTrendData,
    getRevenueTrendData,
    getPaymentMethodDistributionData,
    getPaymentProviderDistributionData,
    getMerchantPerformanceData,
    getHourlyTransactionsData,
    getCurrencyAnalyticsData,
    getStatusAnalyticsData
} = require("../../../services/admin/analytics.service");


/**
 * Dashboard Analytics
 */
const dashboardAnalytics = async (req, res, next) => {

    try {

        const { error, value } = dashboardValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getDashboardAnalytics(value);

        return res.status(200).json({

            success: true,

            message: "Dashboard analytics fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


/**
 * Transaction Trend
 */
const transactionTrend = async (req, res, next) => {

    try {

        const { error, value } = dashboardValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getTransactionTrendData(value);

        return res.status(200).json({

            success: true,

            message: "Transaction trend fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


/**
 * Revenue Trend
 */
const revenueTrend = async (req, res, next) => {

    try {

        const { error, value } = dashboardValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getRevenueTrendData(value);

        return res.status(200).json({

            success: true,

            message: "Revenue trend fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


/**
 * Payment Method Distribution
 */
const paymentMethodDistribution = async (req, res, next) => {

    try {

        const { error, value } = dashboardValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getPaymentMethodDistributionData(value);

        return res.status(200).json({

            success: true,

            message: "Payment method distribution fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


/**
 * Payment Provider Distribution
 */
const paymentProviderDistribution = async (req, res, next) => {

    try {

        const { error, value } = dashboardValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getPaymentProviderDistributionData(value);

        return res.status(200).json({

            success: true,

            message: "Payment provider distribution fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


/**
 * Merchant Performance
 */
const merchantPerformance = async (req, res, next) => {

    try {

        const { error, value } = dashboardValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getMerchantPerformanceData(value);

        return res.status(200).json({

            success: true,

            message: "Merchant performance fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


/**
 * Hourly Transactions
 */
const hourlyTransactions = async (req, res, next) => {

    try {

        const { error, value } = dashboardValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getHourlyTransactionsData(value);

        return res.status(200).json({

            success: true,

            message: "Hourly transactions fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


/**
 * Currency Analytics
 */
const currencyAnalytics = async (req, res, next) => {

    try {

        const { error, value } = dashboardValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getCurrencyAnalyticsData(value);

        return res.status(200).json({

            success: true,

            message: "Currency analytics fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


/**
 * Transaction Status Analytics
 */
const statusAnalytics = async (req, res, next) => {

    try {

        const { error, value } = dashboardValidation.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const data = await getStatusAnalyticsData(value);

        return res.status(200).json({

            success: true,

            message: "Transaction status analytics fetched successfully.",

            data

        });

    } catch (err) {

        next(err);

    }

};


module.exports = {

    dashboardAnalytics,

    transactionTrend,

    revenueTrend,

    paymentMethodDistribution,

    paymentProviderDistribution,

    merchantPerformance,

    hourlyTransactions,

    currencyAnalytics,

    statusAnalytics

};