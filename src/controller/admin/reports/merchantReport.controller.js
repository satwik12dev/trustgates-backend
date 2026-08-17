const {
    getMerchantReportService,
    getMerchantDashboardService
} = require("../../../services/admin/reports/merchantReport.service");

const {
    getMerchantAnalyticsService,
    getMerchantRecentTransactionsService,
    exportMerchantReportService
} = require("../../../services/admin/reports/merchantReport.service");


const {
    merchantReportValidation
} = require("../../../validations/admin/reports/report.validation");


/**
 * ============================================================
 * GET MERCHANT REPORT
 * GET /admin/reports/merchant/:merchantId
 * ============================================================
 */

const getMerchantReport = async (req, res) => {

    try {

        const payload = {

            ...req.query,

            merchantId: Number(req.params.merchantId)

        };

        const { error, value } =
            merchantReportValidation.validate(payload);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const report =
            await getMerchantReportService(value);

        return res.status(200).json({

            success: true,

            message: "Merchant report fetched successfully.",

            data: report

        });

    } catch (error) {

        console.error("Merchant Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch merchant report.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * GET MERCHANT DASHBOARD
 * GET /admin/reports/merchant/:merchantId/dashboard
 * ============================================================
 */

const getMerchantDashboard = async (req, res) => {

    try {
        const payload = {

            ...req.query,

            merchantId: Number(req.params.merchantId)

        };

        const { error, value } =
            merchantReportValidation.validate(payload);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const dashboard =
            await getMerchantDashboardService(value);

        return res.status(200).json({

            success: true,

            message: "Merchant dashboard fetched successfully.",

            data: dashboard

        });

    } catch (error) {

        console.error("Merchant Dashboard Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch merchant dashboard.",

            error: error.message

        });

    }

};

/**
 * ============================================================
 * GET MERCHANT ANALYTICS
 * GET /admin/reports/merchant/:merchantId/analytics
 * ============================================================
 */

const getMerchantAnalytics = async (req, res) => {

    try {

        const payload = {

            ...req.query,

            merchantId: Number(req.params.merchantId)

        };

        const { error, value } =
            merchantReportValidation.validate(payload);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const analytics =
            await getMerchantAnalyticsService(value);

        return res.status(200).json({

            success: true,

            message: "Merchant analytics fetched successfully.",

            data: analytics

        });

    } catch (error) {

        console.error("Merchant Analytics Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch merchant analytics.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * GET MERCHANT RECENT TRANSACTIONS
 * GET /admin/reports/merchant/:merchantId/transactions
 * ============================================================
 */

const getMerchantRecentTransactions = async (req, res) => {

    try {

        const payload = {

            ...req.query,

            merchantId: Number(req.params.merchantId)

        };

        const { error, value } =
            merchantReportValidation.validate(payload);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const transactions =
            await getMerchantRecentTransactionsService(value);

        return res.status(200).json({

            success: true,

            message: "Merchant transactions fetched successfully.",

            data: transactions

        });

    } catch (error) {

        console.error("Merchant Transactions Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch merchant transactions.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * EXPORT MERCHANT REPORT
 * POST /admin/reports/merchant/:merchantId/export
 * ============================================================
 */

const exportMerchantReport = async (req, res) => {

    try {

        const payload = {

    ...req.query,

    ...req.body,

    merchantId: Number(req.params.merchantId)

};

        const { error, value } =
            merchantReportValidation.validate(payload);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await exportMerchantReportService(value);

        return res.status(200).json({

            success: true,

            message: "Merchant report exported successfully.",

            data: result

        });

    } catch (error) {

        console.error("Export Merchant Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to export merchant report.",

            error: error.message

        });

    }

};

/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {

    getMerchantReport,

    getMerchantDashboard,

    getMerchantAnalytics,

    getMerchantRecentTransactions,

    exportMerchantReport

};