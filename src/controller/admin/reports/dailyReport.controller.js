const {
    getDailyReportService,
    getDailyTransactionsService
} = require("../../../services/admin/reports/dailyReport.service");


const {
    searchDailyTransactionsService,
    filterDailyTransactionsService,
    exportDailyReportService
} = require("../../../services/admin/reports/dailyReport.service");


const {
    exportDailyReportValidation
} = require("../../../validations/admin/reports/report.validation");


/**
 * ============================================================
 * GET DAILY REPORT
 * GET /admin/reports/daily
 * ============================================================
 */

const getDailyReport = async (req, res) => {

    try {

        const { error, value } =
            dailyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const report =
            await getDailyReportService(value);

        return res.status(200).json({

            success: true,

            message: "Daily report fetched successfully.",

            data: report

        });

    } catch (error) {

        console.error("Daily Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch daily report.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * GET DAILY TRANSACTIONS
 * GET /admin/reports/daily/transactions
 * ============================================================
 */

const getDailyTransactions = async (req, res) => {

    try {

        const { error, value } =
            dailyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const transactions =
            await getDailyTransactionsService(value);

        return res.status(200).json({

            success: true,

            message: "Daily transactions fetched successfully.",

            data: transactions

        });

    } catch (error) {

        console.error("Daily Transactions Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch daily transactions.",

            error: error.message

        });

    }

};

/**
 * ============================================================
 * SEARCH DAILY TRANSACTIONS
 * GET /admin/reports/daily/search
 * ============================================================
 */

const searchDailyTransactions = async (req, res) => {

    try {

        const { error, value } =
            dailyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await searchDailyTransactionsService(value);

        return res.status(200).json({

            success: true,

            message: "Daily transactions fetched successfully.",

            data: result

        });

    } catch (error) {

        console.error("Search Daily Transactions Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to search daily transactions.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * FILTER DAILY TRANSACTIONS
 * GET /admin/reports/daily/filter
 * ============================================================
 */

const filterDailyTransactions = async (req, res) => {

    try {

        const { error, value } =
            dailyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await filterDailyTransactionsService(value);

        return res.status(200).json({

            success: true,

            message: "Daily transactions fetched successfully.",

            data: result

        });

    } catch (error) {

        console.error("Filter Daily Transactions Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to filter daily transactions.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * EXPORT DAILY REPORT
 * POST /admin/reports/daily/export
 * ============================================================
 */

const exportDailyReport = async (req, res) => {

    try {

const { error, value } =
    exportDailyReportValidation.validate(req.body);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await exportDailyReportService(value);

        return res.status(200).json({

            success: true,

            message: "Daily report exported successfully.",

            data: result

        });

    } catch (error) {

        console.error("Export Daily Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to export daily report.",

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

    getDailyReport,

    getDailyTransactions,

    searchDailyTransactions,

    filterDailyTransactions,

    exportDailyReport

};