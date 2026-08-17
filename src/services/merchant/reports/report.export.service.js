const {
    getDailyReport,
    getMonthlyReport
} = require(
    "./reports.service"
);


// ==========================================================
// Common Export Utilities
// ==========================================================

const {
    exportCSV
} = require(
    "../../../utils/merchant/reports/csvExport"
);

const {
    exportExcel
} = require(
    "../../../utils/merchant/reports/excelExport"
);

const {
    exportPDF
} = require(
    "../../../utils/merchant/reports/pdfExport"
);


// ==========================================================
// Report Headers
// ==========================================================

const REPORT_HEADERS = [

    {
        id: "transaction_id",
        title: "TRANSACTION ID"
    },

    {
        id: "transaction_ref",
        title: "TRANSACTION REF"
    },

    {
        id: "order_id",
        title: "ORDER ID"
    },

    {
        id: "gateway_order_id",
        title: "GATEWAY ORDER ID"
    },

    {
        id: "gateway_payment_id",
        title: "GATEWAY PAYMENT ID"
    },

    {
        id: "gateway_reference",
        title: "GATEWAY REFERENCE"
    },

    {
        id: "customer_name",
        title: "CUSTOMER"
    },

    {
        id: "customer_email",
        title: "CUSTOMER EMAIL"
    },

    {
        id: "customer_phone",
        title: "CUSTOMER PHONE"
    },

    {
        id: "amount",
        title: "AMOUNT"
    },

    {
        id: "currency",
        title: "CURRENCY"
    },

    {
        id: "payment_method",
        title: "PAYMENT METHOD"
    },

    {
        id: "gateway_name",
        title: "GATEWAY"
    },

    {
        id: "payment_type",
        title: "PAYMENT TYPE"
    },

    {
        id: "status",
        title: "STATUS"
    },

    {
        id: "completion_source",
        title: "COMPLETION SOURCE"
    },

    {
        id: "settlement_status",
        title: "SETTLEMENT STATUS"
    },

    {
        id: "settled_at",
        title: "SETTLED AT"
    },

    {
        id: "failure_code",
        title: "FAILURE CODE"
    },

    {
        id: "failure_message",
        title: "FAILURE MESSAGE"
    },

    {
        id: "attempt_count",
        title: "ATTEMPT COUNT"
    },

    {
        id: "created_at",
        title: "CREATED AT"
    },

    {
        id: "completed_at",
        title: "COMPLETED AT"
    },

    {
        id: "updated_at",
        title: "UPDATED AT"
    }

];


// ==========================================================
// Excel Columns
// ==========================================================

const EXCEL_COLUMNS =
    REPORT_HEADERS.map(
        (header) => ({

            header:
                header.title,

            key:
                header.id,

            width:
                20

        })
    );


// ==========================================================
// Prepare Records
// ==========================================================

const prepareRecords = (
    transactions = []
) => {

    return transactions.map(
        (transaction) => ({

            transaction_id:
                transaction.transaction_id,

            transaction_ref:
                transaction.transaction_ref,

            order_id:
                transaction.order_id,

            gateway_order_id:
                transaction.gateway_order_id,

            gateway_payment_id:
                transaction.gateway_payment_id,

            gateway_reference:
                transaction.gateway_reference,

            customer_name:
                transaction.customer_name,

            customer_email:
                transaction.customer_email,

            customer_phone:
                transaction.customer_phone,

            amount:
                transaction.amount,

            currency:
                transaction.currency,

            payment_method:
                transaction.payment_method,

            gateway_name:
                transaction.gateway_name,

            payment_type:
                transaction.payment_type,

            status:
                transaction.status,

            completion_source:
                transaction.completion_source,

            settlement_status:
                transaction.settlement_status,

            settled_at:
                transaction.settled_at,

            failure_code:
                transaction.failure_code,

            failure_message:
                transaction.failure_message,

            attempt_count:
                transaction.attempt_count,

            created_at:
                transaction.created_at,

            completed_at:
                transaction.completed_at,

            updated_at:
                transaction.updated_at

        })
    );

};

// ==========================================================
// Prepare Summary For Export
// ==========================================================

const prepareSummary = (
    summary = {}
) => {

    return {

        // ==================================================
        // TOTAL
        // ==================================================

        totalTransactions:
            Number(
                summary.totalTransactions || 0
            ),

        totalAmount:
            Number(
                summary.totalAmount || 0
            ),


        // ==================================================
        // SUCCESS
        // ==================================================

        successfulTransactions:
            Number(
                summary.successfulTransactions || 0
            ),

        successfulAmount:
            Number(
                summary.successfulAmount || 0
            ),


        // ==================================================
        // PENDING
        // ==================================================

        pendingTransactions:
            Number(
                summary.pendingTransactions || 0
            ),

        pendingAmount:
            Number(
                summary.pendingAmount || 0
            ),


        // ==================================================
        // CREATED
        // ==================================================

        createdTransactions:
            Number(
                summary.createdTransactions || 0
            ),

        createdAmount:
            Number(
                summary.createdAmount || 0
            ),


        // ==================================================
        // AUTHORIZED
        // IMPORTANT
        // ==================================================

        authorizedTransactions:
            Number(
                summary.authorizedTransactions || 0
            ),

        authorizedAmount:
            Number(
                summary.authorizedAmount || 0
            ),


        // ==================================================
        // FAILED
        // ==================================================

        failedTransactions:
            Number(
                summary.failedTransactions || 0
            ),

        failedAmount:
            Number(
                summary.failedAmount || 0
            ),


        // ==================================================
        // CANCELLED
        // ==================================================

        cancelledTransactions:
            Number(
                summary.cancelledTransactions || 0
            ),

        cancelledAmount:
            Number(
                summary.cancelledAmount || 0
            ),


        // ==================================================
        // REFUNDED
        // ==================================================

        refundedTransactions:
            Number(
                summary.refundedTransactions || 0
            ),

        refundedAmount:
            Number(
                summary.refundedAmount || 0
            ),


        // ==================================================
        // PARTIALLY REFUNDED
        // ==================================================
        partiallyRefundedTransactions:
            Number(
                summary.partiallyRefundedTransactions || 0
            ),
        partiallyRefundedAmount:
            Number(
                summary.partiallyRefundedAmount || 0
            ),
        // ==================================================
        // CHARGEBACK
        // ==================================================
        chargebackTransactions:
            Number(
                summary.chargebackTransactions || 0
            ),
        chargebackAmount:
            Number(
                summary.chargebackAmount || 0
            )
    };

};


// ==========================================================
// Daily Report Export
// ==========================================================

const exportDailyReport = async (
    merchantId,
    date,
    format
) => {

    const report =
        await getDailyReport(
            merchantId,
            date
        );


    const records =
        prepareRecords(
            report.transactions
        );


    const summary =
        prepareSummary(
            report.summary
        );


    const normalizedFormat =
        String(format)
            .toUpperCase();


    const fileName =
        `daily_transaction_report_${date}`;


    // ======================================================
    // CSV
    // ======================================================

    if (
        normalizedFormat === "CSV"
    ) {

        return await exportCSV({

            fileName,

            headers:
                REPORT_HEADERS,

            records

        });

    }


    // ======================================================
    // EXCEL
    // ======================================================

    if (
        normalizedFormat === "EXCEL" ||
        normalizedFormat === "XLSX"
    ) {

        return await exportExcel({

            fileName,

            sheetName:
                "Daily Report",

            columns:
                EXCEL_COLUMNS,

            records

        });

    }


    // ======================================================
    // PDF
    // ======================================================

    if (
        normalizedFormat === "PDF"
    ) {

        return await exportPDF({

            fileName,

            title: "Daily Transaction Report",

            summary,

            records,

            filters: {
                reportType: "DAILY",
                date
            },

            generatedBy: "MERCHANT"

        });

    }


    throw new Error(
        `Unsupported export format: ${format}`
    );

};


// ==========================================================
// Monthly Report Export
// ==========================================================

const exportMonthlyReport = async (
    merchantId,
    month,
    year,
    format
) => {

    const report =
        await getMonthlyReport(
            merchantId,
            month,
            year
        );


    const records =
        prepareRecords(
            report.transactions
        );


    const summary =
        prepareSummary(
            report.summary
        );


    const normalizedFormat =
        String(format)
            .toUpperCase();


    const monthNumber =
        String(month)
            .padStart(2, "0");


    const fileName =
        `monthly_transaction_report_${year}_${monthNumber}`;


    // ======================================================
    // CSV
    // ======================================================

    if (
        normalizedFormat === "CSV"
    ) {

        return await exportCSV({

            fileName,

            headers:
                REPORT_HEADERS,

            records

        });

    }


    // ======================================================
    // EXCEL
    // ======================================================

    if (
        normalizedFormat === "EXCEL" ||
        normalizedFormat === "XLSX"
    ) {

        return await exportExcel({

            fileName,

            sheetName:
                "Monthly Report",

            columns:
                EXCEL_COLUMNS,

            records

        });

    }


    // ======================================================
    // PDF
    // ======================================================

    if (
        normalizedFormat === "PDF"
    ) {

        return await exportPDF({

            fileName,

            title: "Monthly Transaction Report",

            summary,

            records,

            filters: {
                reportType: "MONTHLY",
                month,
                year
            },

            generatedBy: "MERCHANT"

        });

    }


    throw new Error(
        `Unsupported export format: ${format}`
    );

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    exportDailyReport,

    exportMonthlyReport

};