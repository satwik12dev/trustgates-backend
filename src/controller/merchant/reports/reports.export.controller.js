const {
    dailyExportValidation,
    monthlyExportValidation
} = require(
    "../../../validations/merchant/reports/reports.validation"
);


const {
    exportDailyReport,
    exportMonthlyReport
} = require(
    "../../../services/merchant/reports/report.export.service"
);


// ==========================================================
// PDF / CSV / EXCEL CLEANUP
// ==========================================================

const cleanupExportFile = async (
    result
) => {

    if (
        !result ||
        !result.filePath
    ) {

        return;

    }


    try {

        const fs =
            require("fs");


        if (
            fs.existsSync(
                result.filePath
            )
        ) {

            await fs.promises.unlink(
                result.filePath
            );

        }

    } catch (error) {

        console.error(
            "Failed to cleanup export file:",
            error.message
        );

    }

};


// ==========================================================
// Helper: Send Export File
// ==========================================================

const sendExportFile = async (
    res,
    result
) => {

    if (
        !result ||
        !result.filePath ||
        !result.fileName
    ) {

        return res.status(500).json({

            success: false,

            message:
                "Export file was not generated."

        });

    }


    // ======================================================
    // Content Type
    // ======================================================

    let contentType = "application/octet-stream";


    if (result.fileName.endsWith(".csv")) {
        contentType = "text/csv";
    } else if (result.fileName.endsWith(".xlsx")) {
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    } else if (
        result.fileName.endsWith(
            ".pdf"
        )
    ) {

        contentType =
            "application/pdf";

    }


    // ======================================================
    // Headers
    // ======================================================

    res.setHeader(
        "Content-Type",
        contentType
    );


    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.fileName}"`
    );


    // ======================================================
    // Download File
    // ======================================================

    return res.download(

        result.filePath,

        result.fileName,

        async (error) => {

            // ==============================================
            // IMPORTANT:
            // Delete temporary export file after download
            // ==============================================

            await cleanupExportFile(
                result
            );


            // ==============================================
            // Download Error
            // ==============================================

            if (
                error
            ) {

                console.error(
                    "Export download failed:",
                    error.message
                );


                // Response may already be sent
                if (
                    !res.headersSent
                ) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to download export file."

                    });

                }

            }

        }

    );

};


// ==========================================================
// Daily Report Export
// ==========================================================

const exportDaily = async (
    req,
    res,
    next
) => {

    try {

        // ==============================================
        // Validate Request
        // ==============================================

        const {
            error,
            value
        } =
            dailyExportValidation.validate(
                req.query
            );


        if (
            error
        ) {

            return res.status(400).json({

                success: false,

                message:
                    error.details[0].message

            });

        }


        // ==============================================
        // Merchant From JWT
        // ==============================================

        const merchantId =
            req.user.merchant_id;


        // ==============================================
        // Generate Report
        // ==============================================

        const result =
            await exportDailyReport(

                merchantId,

                value.date,

                value.format

            );


        // ==============================================
        // Download + Cleanup
        // ==============================================

        return sendExportFile(
            res,
            result
        );

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// Monthly Report Export
// ==========================================================

const exportMonthly = async (
    req,
    res,
    next
) => {

    try {

        // ==============================================
        // Validate Request
        // ==============================================

        const {
            error,
            value
        } =
            monthlyExportValidation.validate(
                req.query
            );


        if (
            error
        ) {

            return res.status(400).json({

                success: false,

                message:
                    error.details[0].message

            });

        }


        // ==============================================
        // Merchant From JWT
        // ==============================================

        const merchantId =
            req.user.merchant_id;


        // ==============================================
        // Generate Report
        // ==============================================

        const result =
            await exportMonthlyReport(

                merchantId,

                value.month,

                value.year,

                value.format

            );


        // ==============================================
        // Download + Cleanup
        // ==============================================

        return sendExportFile(
            res,
            result
        );

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    exportDaily,

    exportMonthly

};