const {
    getMonthlyReportService,
    getMonthlyDashboardService
} = require("../../../services/admin/reports/monthlyReport.service");

const {
    getTopMerchantsService,
    getMerchantPerformanceService,
    exportMonthlyReportService
} = require("../../../services/admin/reports/monthlyReport.service");


const {
    monthlyReportValidation,
    exportMonthlyReportValidation
} = require("../../../validations/admin/reports/report.validation");


/**
 * ============================================================
 * GET MONTHLY REPORT
 * GET /admin/reports/monthly
 * ============================================================
 */

const getMonthlyReport = async (req, res) => {

    try {

        const { error, value } =
            monthlyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const report =
            await getMonthlyReportService(value);

        return res.status(200).json({

            success: true,

            message: "Monthly report fetched successfully.",

            data: report

        });

    } catch (error) {

        console.error("Monthly Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch monthly report.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * GET MONTHLY DASHBOARD
 * GET /admin/reports/monthly/dashboard
 * ============================================================
 */

const getMonthlyDashboard = async (req, res) => {

    try {

        const { error, value } =
            monthlyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const dashboard =
            await getMonthlyDashboardService(value);

        return res.status(200).json({

            success: true,

            message: "Monthly dashboard fetched successfully.",

            data: dashboard

        });

    } catch (error) {

        console.error("Monthly Dashboard Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch monthly dashboard.",

            error: error.message

        });

    }

};

/**
 * ============================================================
 * GET TOP MERCHANTS
 * GET /admin/reports/monthly/top-merchants
 * ============================================================
 */

const getTopMerchants = async (req, res) => {

    try {

        const { error, value } =
            monthlyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const merchants =
            await getTopMerchantsService(value);

        return res.status(200).json({

            success: true,

            message: "Top merchants fetched successfully.",

            data: merchants

        });

    } catch (error) {

        console.error("Top Merchants Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch top merchants.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * GET MERCHANT PERFORMANCE
 * GET /admin/reports/monthly/merchant-performance
 * ============================================================
 */

const getMerchantPerformance = async (req, res) => {

    try {

        const { error, value } =
            monthlyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const performance =
            await getMerchantPerformanceService(value);

        return res.status(200).json({

            success: true,

            message: "Merchant performance fetched successfully.",

            data: performance

        });

    } catch (error) {

        console.error("Merchant Performance Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch merchant performance.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * EXPORT MONTHLY REPORT
 * POST /admin/reports/monthly/export
 * ============================================================
 */

const exportMonthlyReport = async (req, res) => {

    try {

        const payload = {
            ...req.query,
            ...req.body
        };

        const { error, value } =
            exportMonthlyReportValidation.validate(payload);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await exportMonthlyReportService(value);

        return res.status(200).json({

            success: true,

            message: "Monthly report exported successfully.",

            data: result

        });

    } catch (error) {

        console.error("Export Monthly Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to export monthly report.",

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

    getMonthlyReport,

    getMonthlyDashboard,

    getTopMerchants,

    getMerchantPerformance,

    exportMonthlyReport

};