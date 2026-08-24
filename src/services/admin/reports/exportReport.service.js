const {
    getExportTransactions,
    getRefundReport,
    getSettlementReport,
    getChargebackReport
} = require("../../../utils/admin/reports/reportQueries");

const {
    exportCSV
} = require("../../../utils/admin/reports/csvExport");

const {
    exportExcel
} = require("../../../utils/admin/reports/excelExport");

const {
    exportPDF
} = require("../../../utils/admin/reports/pdfExport");

// ============================================================
// MONTHLY REPORT SERVICES
// ============================================================
const {
    getMonthlyReportService,
    getMonthlyDashboardService
} = require("./monthlyReport.service");


/**
 * ============================================================
 * REPORT TYPES
 * ============================================================
 */

const REPORT_TYPES = {

    TRANSACTIONS: "TRANSACTIONS",

    DAILY: "DAILY",

    MONTHLY: "MONTHLY",

    MERCHANT: "MERCHANT",

    REFUND: "REFUND",

    SETTLEMENT: "SETTLEMENT",

    CHARGEBACK: "CHARGEBACK"

};



/**
 * ============================================================
 * EXPORT FORMATS
 * ============================================================
 */

const EXPORT_FORMATS = {

    CSV: "CSV",

    EXCEL: "EXCEL",

    PDF: "PDF"

};



/**
 * ============================================================
 * COMMON TRANSACTION HEADERS
 * ============================================================
 */

const TRANSACTION_HEADERS = [

    {
        id: "transaction_id",
        title: "Transaction ID"
    },

    {
        id: "order_id",
        title: "Order ID"
    },

    {
        id: "merchant_name",
        title: "Merchant"
    },

    {
        id: "business_name",
        title: "Business"
    },

    {
        id: "customer_name",
        title: "Customer"
    },

    {
        id: "customer_email",
        title: "Customer Email"
    },

    {
        id: "amount",
        title: "Amount"
    },

    {
        id: "gateway_fee",
        title: "Gateway Fee"
    },

    {
        id: "currency",
        title: "Currency"
    },

    {
        id: "payment_method",
        title: "Payment Method"
    },

    {
        id: "payment_type",
        title: "Payment Type"
    },

    {
        id: "status",
        title: "Status"
    },

    {
        id: "provider_payment_id",
        title: "Gateway Payment ID"
    },

    {
        id: "created_at",
        title: "Created At"
    }

];



/**
 * ============================================================
 * COMMON REFUND HEADERS
 * ============================================================
 */

const REFUND_HEADERS = [

    {
        id: "refund_id",
        title: "Refund ID"
    },

    {
        id: "transaction_id",
        title: "Transaction ID"
    },

    {
        id: "merchant_name",
        title: "Merchant"
    },

    {
        id: "refund_amount",
        title: "Refund Amount"
    },

    {
        id: "refund_reason",
        title: "Refund Reason"
    },

    {
        id: "refund_status",
        title: "Refund Status"
    },

    {
        id: "created_at",
        title: "Created At"
    }

];



/**
 * ============================================================
 * COMMON SETTLEMENT HEADERS
 * ============================================================
 */

const SETTLEMENT_HEADERS = [

    {
        id: "settlement_id",
        title: "Settlement ID"
    },

    {
        id: "transaction_id",
        title: "Transaction ID"
    },

    {
        id: "order_id",
        title: "Order ID"
    },

    {
        id: "merchant_id",
        title: "Merchant ID"
    },

    {
        id: "merchant_name",
        title: "Merchant Name"
    },

    {
        id: "business_name",
        title: "Business Name"
    },

    {
        id: "customer_name",
        title: "Customer Name"
    },

    {
        id: "customer_email",
        title: "Customer Email"
    },

    {
        id: "payment_method",
        title: "Payment Method"
    },

    {
        id: "payment_type",
        title: "Payment Type"
    },

    {
        id: "currency",
        title: "Currency"
    },

    {
        id: "transaction_amount",
        title: "Transaction Amount"
    },

    {
        id: "gross_amount",
        title: "Gross Amount"
    },

    {
        id: "gateway_fee",
        title: "Gateway Fee"
    },

    {
        id: "gst",
        title: "GST"
    },

    {
        id: "tds",
        title: "TDS"
    },

    {
        id: "net_amount",
        title: "Net Amount"
    },

    {
        id: "settlement_status",
        title: "Settlement Status"
    },

    {
        id: "settlement_date",
        title: "Settlement Date"
    },

    {
        id: "created_at",
        title: "Created At"
    }

];



/**
 * ============================================================
 * CHARGEBACK HEADERS
 * ============================================================
 */

const CHARGEBACK_HEADERS = [

    {
        id: "transaction_id",
        title: "Transaction ID"
    },

    {
        id: "order_id",
        title: "Order ID"
    },

    {
        id: "merchant_name",
        title: "Merchant"
    },

    {
        id: "business_name",
        title: "Business"
    },

    {
        id: "customer_name",
        title: "Customer"
    },

    {
        id: "customer_email",
        title: "Customer Email"
    },

    {
        id: "amount",
        title: "Amount"
    },

    {
        id: "payment_method",
        title: "Payment Method"
    },

    {
        id: "payment_type",
        title: "Payment Type"
    },

    {
        id: "status",
        title: "Status"
    },

    {
        id: "created_at",
        title: "Created At"
    }

];



/**
 * ============================================================
 * BUILD EXCEL COLUMNS
 * ============================================================
 */

const buildExcelColumns = (headers) => {

    return headers.map(header => ({

        header: header.title,

        key: header.id,

        width:
            Math.max(
                header.title.length + 5,
                20
            )

    }));

};



/**
 * ============================================================
 * VALIDATE EXPORT FORMAT
 * ============================================================
 */

const validateExportFormat = (format) => {

    if (!format) {

        throw new Error(
            "Export format is required."
        );

    }

    const exportFormat =
        String(format).toUpperCase();

    if (
        !Object.values(
            EXPORT_FORMATS
        ).includes(
            exportFormat
        )
    ) {

        throw new Error(
            "Unsupported export format."
        );

    }

    return exportFormat;

};



/**
 * ============================================================
 * BUILD FILE NAME
 * ============================================================
 */

const buildFileName = ({
    reportType,
    merchantId = null
}) => {

    const timestamp =
        new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );

    let fileName =
        reportType.toLowerCase();

    if (merchantId) {

        fileName +=
            `_merchant_${merchantId}`;

    }

    fileName +=
        `_${timestamp}`;

    return fileName;

};



/**
 * ============================================================
 * FORMAT EXPORT RESPONSE
 * ============================================================
 */

const formatExportResponse = (result) => {

    return {

        success: true,

        message:
            "Report exported successfully.",

        fileName:
            result.fileName,

        filePath:
            result.filePath,

        downloadPath:
            result.downloadPath

    };

};



/**
 * ============================================================
 * GET HEADERS BY REPORT TYPE
 * ============================================================
 */

const getHeadersByReportType = (
    reportType
) => {

    switch (reportType) {

        case REPORT_TYPES.REFUND:

            return REFUND_HEADERS;

        case REPORT_TYPES.SETTLEMENT:

            return SETTLEMENT_HEADERS;

        case REPORT_TYPES.CHARGEBACK:

            return CHARGEBACK_HEADERS;

        default:

            return TRANSACTION_HEADERS;

    }

};



/**
 * ============================================================
 * EXPORT TRANSACTIONS
 * ============================================================
 */

const exportTransactionsService = async (
    filters
) => {

    try {

        const {

            startDate,

            endDate,

            merchantId,

            format,

            reportType =
                REPORT_TYPES.TRANSACTIONS

        } = filters;

        // =====================================================
        // VALIDATE FORMAT
        // =====================================================

        const exportFormat =
            validateExportFormat(
                format
            );

        // =====================================================
        // FETCH RECORDS
        // =====================================================

        const records =
            await getExportTransactions({

                startDate,

                endDate,

                merchantId

            });

        if (
            !records ||
            !records.length
        ) {

            return {

                success: false,

                message:
                    "No records found."

            };

        }

        // =====================================================
        // COMMON CONFIG
        // =====================================================

        const headers =
            getHeadersByReportType(
                reportType
            );

        const fileName =
            buildFileName({

                reportType,

                merchantId

            });

        // =====================================================
        // CSV
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.CSV
        ) {

            const result =
                await exportCSV({

                    fileName,

                    headers,

                    records

                });

            return formatExportResponse(
                result
            );

        }

        // =====================================================
        // EXCEL
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.EXCEL
        ) {

            const result =
                await exportExcel({

                    fileName,

                    sheetName:
                        reportType,

                    columns:
                        buildExcelColumns(
                            headers
                        ),

                    records

                });

            return formatExportResponse(
                result
            );

        }

        // =====================================================
        // PDF
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.PDF
        ) {

            const result =
                await exportPDF({

                    fileName,

                    title:
                        `${reportType} Report`,

                    headers,

                    records

                });

            return formatExportResponse(
                result
            );

        }

        throw new Error(
            "Unsupported export format."
        );

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * EXPORT DAILY REPORT
 * ============================================================
 */

const exportDailyReportService = async (
    filters
) => {

    try {

        const {

            date,

            merchantId,

            format

        } = filters;

        return await exportTransactionsService({

            startDate:
                date,

            endDate:
                date,

            merchantId,

            format,

            reportType:
                REPORT_TYPES.DAILY

        });

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * EXPORT MONTHLY REPORT
 *
 * PDF:
 *
 * 1. Monthly Summary
 * 2. Daily Revenue
 * 3. Daily Transaction Status
 * 4. Daily Refund Summary
 * 5. Top Merchants
 * 6. Merchant Performance
 * 7. ALL Monthly Transactions
 *
 * CSV / EXCEL:
 *
 * Monthly transaction export
 *
 * ============================================================
 */

const exportMonthlyReportService = async (
    filters = {}
) => {

    try {

        const {

            month,

            year,

            merchantId,

            format

        } = filters;

        // =====================================================
        // VALIDATE MONTH / YEAR
        // =====================================================

        if (
            month === undefined ||
            month === null ||
            month === ""
        ) {

            throw new Error(
                "Month and year are required."
            );

        }

        if (
            year === undefined ||
            year === null ||
            year === ""
        ) {

            throw new Error(
                "Month and year are required."
            );

        }

        const numericMonth =
            Number(month);

        const numericYear =
            Number(year);

        if (
            !Number.isInteger(
                numericMonth
            ) ||
            numericMonth < 1 ||
            numericMonth > 12
        ) {

            throw new Error(
                "Invalid month."
            );

        }

        if (
            !Number.isInteger(
                numericYear
            ) ||
            numericYear < 2000 ||
            numericYear > 2100
        ) {

            throw new Error(
                "Invalid year."
            );

        }

        // =====================================================
        // VALIDATE FORMAT
        // =====================================================

        const exportFormat =
            validateExportFormat(
                format
            );

        // =====================================================
        // BUILD MONTH RANGE
        // =====================================================

        const paddedMonth =
            String(
                numericMonth
            ).padStart(
                2,
                "0"
            );

        const startDate =
            `${numericYear}-${paddedMonth}-01`;

        const lastDay =
            new Date(
                numericYear,
                numericMonth,
                0
            ).getDate();

        const endDate =
            `${numericYear}-${paddedMonth}-${String(
                lastDay
            ).padStart(
                2,
                "0"
            )}`;

        // =====================================================
        // FETCH MONTHLY ANALYTICS
        //
        // SAME DATA USED BY:
        // GET /admin/report/monthly
        // =====================================================

        const [
            report,
            dashboard
        ] = await Promise.all([

            getMonthlyReportService({

                month:
                    numericMonth,

                year:
                    numericYear,

                merchantId

            }),

            getMonthlyDashboardService({

                month:
                    numericMonth,

                year:
                    numericYear,

                merchantId

            })

        ]);

        // =====================================================
        // FETCH ALL MONTHLY TRANSACTIONS
        //
        // IMPORTANT:
        // PDF MUST RECEIVE THESE RECORDS.
        // =====================================================

        const records =
            await getExportTransactions({

                startDate,

                endDate,

                merchantId

            });

        // =====================================================
        // NO DATA CHECK
        // =====================================================

        const hasReportData =
            report &&
            report.summary;

        const hasTransactionData =
            Array.isArray(records) &&
            records.length > 0;

        if (
            !hasReportData &&
            !hasTransactionData
        ) {

            return {

                success: false,

                message:
                    "No monthly records found."

            };

        }

        // =====================================================
        // FILE NAME
        // =====================================================

        const fileName =
            `monthly_report_${numericYear}_${paddedMonth}`;

        // =====================================================
        // =====================================================
        // PDF MONTHLY REPORT
        // =====================================================
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.PDF
        ) {

            const result =
                await exportPDF({

                    fileName,

                    title:
                        `Monthly Report (${paddedMonth}/${numericYear})`,

                    reportType:
                        REPORT_TYPES.MONTHLY,

                    // -----------------------------------------
                    // MONTHLY ANALYTICS
                    // -----------------------------------------

                    report,

                    // -----------------------------------------
                    // TOP MERCHANTS + PERFORMANCE
                    // -----------------------------------------

                    dashboard,

                    // -----------------------------------------
                    // ALL MONTH TRANSACTIONS
                    // -----------------------------------------

                    records,

                    headers:
                        TRANSACTION_HEADERS,

                    // -----------------------------------------
                    // OPTIONAL MERCHANT FILTER
                    // -----------------------------------------

                    merchantId,

                    // -----------------------------------------
                    // HEADER FILTER INFORMATION
                    // -----------------------------------------

                    filters: {

                        month:
                            paddedMonth,

                        year:
                            numericYear,

                        ...(merchantId
                            ? {
                                merchantId
                            }
                            : {})

                    }

                });

            return formatExportResponse(
                result
            );

        }

        // =====================================================
        // =====================================================
        // CSV MONTHLY TRANSACTION EXPORT
        // =====================================================
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.CSV
        ) {

            const result =
                await exportCSV({

                    fileName,

                    headers:
                        TRANSACTION_HEADERS,

                    records

                });

            return formatExportResponse(
                result
            );

        }

        // =====================================================
        // =====================================================
        // EXCEL MONTHLY TRANSACTION EXPORT
        // =====================================================
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.EXCEL
        ) {

            const result =
                await exportExcel({

                    fileName,

                    sheetName:
                        "Monthly Transactions",

                    columns:
                        buildExcelColumns(
                            TRANSACTION_HEADERS
                        ),

                    records

                });

            return formatExportResponse(
                result
            );

        }

        throw new Error(
            "Unsupported export format."
        );

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * EXPORT MERCHANT REPORT
 * ============================================================
 */

const exportMerchantReportService = async (
    filters
) => {

    try {

        const {

            merchantId,

            startDate,

            endDate,

            format

        } = filters;

        return await exportTransactionsService({

            startDate,

            endDate,

            merchantId,

            format,

            reportType:
                REPORT_TYPES.MERCHANT

        });

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * EXPORT REFUND REPORT
 * ============================================================
 */

const exportRefundReportService = async (
    filters
) => {

    try {

        const {

            startDate,

            endDate,

            merchantId,

            refundStatus,

            format

        } = filters;

        const exportFormat =
            validateExportFormat(
                format
            );

        const records =
            await getRefundReport({

                startDate,

                endDate,

                merchantId,

                refundStatus,

                page: 1,

                limit: 1000000

            });

        if (
            !records ||
            !records.length
        ) {

            return {

                success: false,

                message:
                    "No refund records found."

            };

        }

        const fileName =
            buildFileName({

                reportType:
                    REPORT_TYPES.REFUND,

                merchantId

            });

        // =====================================================
        // CSV
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.CSV
        ) {

            return formatExportResponse(

                await exportCSV({

                    fileName,

                    headers:
                        REFUND_HEADERS,

                    records

                })

            );

        }

        // =====================================================
        // EXCEL
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.EXCEL
        ) {

            return formatExportResponse(

                await exportExcel({

                    fileName,

                    sheetName:
                        "Refund Report",

                    columns:
                        buildExcelColumns(
                            REFUND_HEADERS
                        ),

                    records

                })

            );

        }

        // =====================================================
        // PDF
        // =====================================================

        return formatExportResponse(

            await exportPDF({

                fileName,

                title:
                    "Refund Report",

                headers:
                    REFUND_HEADERS,

                records

            })

        );

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * EXPORT SETTLEMENT REPORT
 * ============================================================
 */

const exportSettlementReportService = async (
    filters
) => {

    try {

        const {

            startDate,

            endDate,

            merchantId,

            settlementStatus,

            format

        } = filters;

        const exportFormat =
            validateExportFormat(
                format
            );

        const records =
            await getSettlementReport({

                startDate,

                endDate,

                merchantId,

                settlementStatus,

                page: 1,

                limit: 1000000

            });

        if (
            !records ||
            !records.length
        ) {

            return {

                success: false,

                message:
                    "No settlement records found."

            };

        }

        const fileName =
            buildFileName({

                reportType:
                    REPORT_TYPES.SETTLEMENT,

                merchantId

            });

        // =====================================================
        // CSV
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.CSV
        ) {

            return formatExportResponse(

                await exportCSV({

                    fileName,

                    headers:
                        SETTLEMENT_HEADERS,

                    records

                })

            );

        }

        // =====================================================
        // EXCEL
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.EXCEL
        ) {

            return formatExportResponse(

                await exportExcel({

                    fileName,

                    sheetName:
                        "Settlement Report",

                    columns:
                        buildExcelColumns(
                            SETTLEMENT_HEADERS
                        ),

                    records

                })

            );

        }

        // =====================================================
        // PDF
        // =====================================================

        return formatExportResponse(

            await exportPDF({

                fileName,

                title:
                    "Settlement Report",

                headers:
                    SETTLEMENT_HEADERS,

                records

            })

        );

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * EXPORT CHARGEBACK REPORT
 * ============================================================
 */

const exportChargebackReportService = async (
    filters
) => {

    try {

        const {

            startDate,

            endDate,

            merchantId,

            format

        } = filters;

        const exportFormat =
            validateExportFormat(
                format
            );

        const records =
            await getChargebackReport({

                startDate,

                endDate,

                merchantId

            });

        if (
            !records ||
            !records.length
        ) {

            return {

                success: false,

                message:
                    "No chargeback records found."

            };

        }

        const fileName =
            buildFileName({

                reportType:
                    REPORT_TYPES.CHARGEBACK,

                merchantId

            });

        // =====================================================
        // CSV
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.CSV
        ) {

            return formatExportResponse(

                await exportCSV({

                    fileName,

                    headers:
                        CHARGEBACK_HEADERS,

                    records

                })

            );

        }

        // =====================================================
        // EXCEL
        // =====================================================

        if (
            exportFormat ===
            EXPORT_FORMATS.EXCEL
        ) {

            return formatExportResponse(

                await exportExcel({

                    fileName,

                    sheetName:
                        "Chargeback Report",

                    columns:
                        buildExcelColumns(
                            CHARGEBACK_HEADERS
                        ),

                    records

                })

            );

        }

        // =====================================================
        // PDF
        // =====================================================

        return formatExportResponse(

            await exportPDF({

                fileName,

                title:
                    "Chargeback Report",

                headers:
                    CHARGEBACK_HEADERS,

                records

            })

        );

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * DOWNLOAD REPORT
 * ============================================================
 */

const downloadReportService = async (
    filters
) => {

    try {

        const result =
            await exportReportByTypeService(
                filters
            );

        return {

            success: true,

            message:
                "Report generated successfully.",

            fileName:
                result.fileName,

            filePath:
                result.filePath,

            downloadPath:
                result.downloadPath

        };

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * EXPORT REPORT BY TYPE
 * ============================================================
 */

const exportReportByTypeService = async (
    filters
) => {

    try {

        const {
            reportType
        } = filters;

        switch (
            reportType
        ) {

            case REPORT_TYPES.DAILY:

                return await exportDailyReportService(
                    filters
                );

            case REPORT_TYPES.MONTHLY:

                return await exportMonthlyReportService(
                    filters
                );

            case REPORT_TYPES.MERCHANT:

                return await exportMerchantReportService(
                    filters
                );

            case REPORT_TYPES.REFUND:

                return await exportRefundReportService(
                    filters
                );

            case REPORT_TYPES.SETTLEMENT:

                return await exportSettlementReportService(
                    filters
                );

            case REPORT_TYPES.CHARGEBACK:

                return await exportChargebackReportService(
                    filters
                );

            case REPORT_TYPES.TRANSACTIONS:

                return await exportTransactionsService(
                    filters
                );

            default:

                throw new Error(
                    "Invalid report type."
                );

        }

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * GET AVAILABLE REPORT TYPES
 * ============================================================
 */

const getAvailableReportTypesService = () => {

    return {

        reportTypes:
            Object.values(
                REPORT_TYPES
            ),

        exportFormats:
            Object.values(
                EXPORT_FORMATS
            )

    };

};



/**
 * ============================================================
 * FINAL EXPORTS
 * ============================================================
 */

module.exports = {

    // =========================================================
    // COMMON
    // =========================================================

    exportTransactionsService,

    exportReportByTypeService,

    downloadReportService,

    getAvailableReportTypesService,

    // =========================================================
    // DAILY
    // =========================================================

    exportDailyReportService,

    // =========================================================
    // MONTHLY
    // =========================================================

    exportMonthlyReportService,

    // =========================================================
    // MERCHANT
    // =========================================================

    exportMerchantReportService,

    // =========================================================
    // REFUND
    // =========================================================

    exportRefundReportService,

    // =========================================================
    // SETTLEMENT
    // =========================================================

    exportSettlementReportService,

    // =========================================================
    // CHARGEBACK
    // =========================================================

    exportChargebackReportService

};