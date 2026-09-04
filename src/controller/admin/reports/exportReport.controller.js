const fs = require("fs");

const {
    exportReportByTypeService,
    getAvailableReportTypesService,
    exportDailyReportService,
    exportMonthlyReportService,
    exportMerchantReportService,
    exportRefundReportService,
    exportSettlementReportService,
    exportChargebackReportService
} = require("../../../services/admin/reports/exportReport.service");

const {
    exportReportValidation
} = require("../../../validations/admin/reports/report.validation");


/**
 * ============================================================
 * EXPORT REPORT BY TYPE
 * POST /admin/reports/export
 * ============================================================
 */

const exportReportByType = async (req, res) => {

    try {

        const { error, value } =
            exportReportValidation.validate(req.body);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await exportReportByTypeService(value);

        return res.status(200).json({

            success: true,

            message: "Report exported successfully.",

            data: result

        });

    } catch (error) {

        console.error("Export Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to export report.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * GET AVAILABLE REPORT TYPES
 * GET /admin/reports/export/types
 * ============================================================
 */

const getAvailableReportTypes = async (req, res) => {

    try {

        const result =
            getAvailableReportTypesService();

        return res.status(200).json({

            success: true,

            message: "Available report types fetched successfully.",

            data: result

        });

    } catch (error) {

        console.error("Available Report Types Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch available report types.",

            error: error.message

        });

    }

};

/**
 * ============================================================
 * EXPORT DAILY REPORT
 * POST /admin/reports/export/daily
 * ============================================================
 */

const exportDailyReport = async (req, res) => {

    let filePath = null;

    try {

        const {
            error,
            value
        } = exportReportValidation.validate(
            req.body
        );

        if (error) {

            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });

        }

        const result =
            await exportDailyReportService(value);

        filePath = result.filePath;

        if (!filePath) {

            return res.status(500).json({
                success: false,
                message: "Export file was not generated."
            });

        }

        if (!fs.existsSync(filePath)) {

            return res.status(500).json({
                success: false,
                message: "Export file does not exist."
            });

        }

        /*
         * Send actual file
         */
        res.download(
            filePath,
            result.fileName,
            {
                headers: {
                    "Content-Type":
                        value.format === "PDF"
                            ? "application/pdf"
                            : value.format === "CSV"
                                ? "text/csv"
                                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            },
            (downloadError) => {

                if (downloadError) {

                    console.error(
                        "Daily Report Download Error:",
                        downloadError
                    );

                }

                /*
                 * Delete generated file
                 * after response is completed
                 */
                fs.unlink(
                    filePath,
                    (deleteError) => {

                        if (deleteError) {

                            console.error(
                                "Failed to delete daily report file:",
                                deleteError
                            );

                        } else {

                            console.log(
                                "Daily report file deleted:",
                                filePath
                            );

                        }

                    }
                );

            }
        );

    } catch (error) {

        console.error(
            "Export Daily Report Error:",
            error
        );

        if (
            filePath &&
            fs.existsSync(filePath)
        ) {

            fs.unlink(
                filePath,
                (deleteError) => {

                    if (deleteError) {

                        console.error(
                            "Failed to cleanup daily report file:",
                            deleteError
                        );

                    }

                }
            );

        }

        return res.status(500).json({

            success: false,

            message:
                "Failed to export daily report.",

            error:
                error.message

        });

    }

};



/**
 * ============================================================
 * EXPORT MONTHLY REPORT
 * POST /admin/reports/export/monthly
 * ============================================================
 */

const exportMonthlyReport = async (req, res) => {

    try {

        const { error, value } =
            exportReportValidation.validate(req.body);

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
 * EXPORT MERCHANT REPORT
 * POST /admin/reports/export/merchant
 * ============================================================
 */

const exportMerchantReport = async (req, res) => {

    try {

        const { error, value } =
            exportReportValidation.validate(req.body);

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
 * EXPORT REFUND REPORT
 * POST /admin/reports/export/refund
 * ============================================================
 */

const exportRefundReport = async (req, res) => {

    try {

        const { error, value } =
            exportReportValidation.validate(req.body);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await exportRefundReportService(value);

        return res.status(200).json({

            success: true,

            message: "Refund report exported successfully.",

            data: result

        });

    } catch (error) {

        console.error("Export Refund Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to export refund report.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * EXPORT SETTLEMENT REPORT
 * POST /admin/reports/export/settlement
 * ============================================================
 */

const exportSettlementReport = async (req, res) => {

    try {

        const { error, value } =
            exportReportValidation.validate(req.body);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await exportSettlementReportService(value);

        return res.status(200).json({

            success: true,

            message: "Settlement report exported successfully.",

            data: result

        });

    } catch (error) {

        console.error("Export Settlement Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to export settlement report.",

            error: error.message

        });

    }

};



/**
 * ============================================================
 * EXPORT CHARGEBACK REPORT
 * POST /admin/reports/export/chargeback
 * ============================================================
 */

const exportChargebackReport = async (req, res) => {

    try {

        const { error, value } =
            exportReportValidation.validate(req.body);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await exportChargebackReportService(value);

        return res.status(200).json({

            success: true,

            message: "Chargeback report exported successfully.",

            data: result

        });

    } catch (error) {

        console.error("Export Chargeback Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to export chargeback report.",

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

    // Generic Export
    exportReportByType,
    getAvailableReportTypes,

    // Daily
    exportDailyReport,

    // Monthly
    exportMonthlyReport,

    // Merchant
    exportMerchantReport,

    // Refund
    exportRefundReport,

    // Settlement
    exportSettlementReport,

    // Chargeback
    exportChargebackReport

};