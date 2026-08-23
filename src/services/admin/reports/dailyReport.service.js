const {
    getDailySummary,
    getHourlyTransactions,
    getPaymentMethodDistribution,
    getPaymentTypeDistribution,
    getDailyTransactions,
    getDailyTransactionsCount,
    getExportTransactions
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


/**
 * ============================================================
 * DAILY REPORT SERVICE
 * ============================================================
 *
 * GET /admin/reports/daily
 *
 * Returns:
 * - Summary
 * - Hourly chart
 * - Payment method chart
 * - Payment type chart
 * - Optional transactions for export
 *
 * IMPORTANT:
 * Normal dashboard request does NOT load all transactions.
 * Transactions are loaded only when includeTransactions=true.
 */

const getDailyReportService = async (
    filters,
    includeTransactions = false
) => {

    try {

        const {
            date,
            merchantId,
            paymentMethod,
            paymentType,
            status
        } = filters;


        // =====================================================
        // DAILY SUMMARY
        // =====================================================

        const summary =
            await getDailySummary({

                date,

                merchantId,

                paymentMethod,

                paymentType,

                status

            });


        // =====================================================
        // HOURLY ANALYTICS
        // =====================================================

        const hourlyTransactions =
            await getHourlyTransactions({

                date,

                merchantId

            });


        // =====================================================
        // PAYMENT METHOD DISTRIBUTION
        // =====================================================

        const paymentMethodDistribution =
            await getPaymentMethodDistribution({

                date,

                merchantId

            });


        // =====================================================
        // PAYMENT TYPE DISTRIBUTION
        // =====================================================

        const paymentTypeDistribution =
            await getPaymentTypeDistribution({

                date,

                merchantId

            });


        // =====================================================
        // SUMMARY NUMBERS
        // =====================================================

        const totalTransactions =
            Number(
                summary.totalTransactions || 0
            );


        const successfulTransactions =
            Number(
                summary.successfulTransactions || 0
            );


        const successRate =
            totalTransactions === 0
                ? 0
                : Number(
                    (
                        (
                            successfulTransactions /
                            totalTransactions
                        ) * 100
                    ).toFixed(2)
                );


        // =====================================================
        // DASHBOARD CARDS
        // =====================================================

        const dashboardCards = {

            totalTransactions,

            successfulTransactions,

            createdTransactions:
                Number(
                    summary.createdTransactions || 0
                ),

            failedTransactions:
                Number(
                    summary.failedTransactions || 0
                ),

            pendingTransactions:
                Number(
                    summary.pendingTransactions || 0
                ),

            refundedTransactions:
                Number(
                    summary.refundedTransactions || 0
                ),

            chargebackTransactions:
                Number(
                    summary.chargebackTransactions || 0
                ),

            totalRevenue:
                Number(
                    summary.totalRevenue || 0
                ),

            totalGatewayFee:
                Number(
                    summary.totalGatewayFee || 0
                ),

            averageTransactionAmount:
                Number(
                    summary.averageTransactionAmount || 0
                ),

            successRate

        };


        // =====================================================
        // HOURLY CHART
        // =====================================================

        const hourlyChart = [];


        for (
            let hour = 0;
            hour < 24;
            hour++
        ) {

            const transaction =
                hourlyTransactions.find(
                    item =>
                        Number(item.hour) === hour
                );


            hourlyChart.push({

                hour:
                    `${hour}:00`,

                totalTransactions:
                    transaction
                        ? Number(
                            transaction.totalTransactions || 0
                        )
                        : 0,

                successfulTransactions:
                    transaction
                        ? Number(
                            transaction.successfulTransactions || 0
                        )
                        : 0,

                totalAmount:
                    transaction
                        ? Number(
                            transaction.totalAmount || 0
                        )
                        : 0

            });

        }


        // =====================================================
        // PAYMENT METHOD CHART
        // =====================================================

        const paymentMethodChart =
            paymentMethodDistribution.map(
                item => ({

                    paymentMethod:
                        item.payment_method,

                    totalTransactions:
                        Number(
                            item.totalTransactions || 0
                        ),

                    successfulTransactions:
                        Number(
                            item.successfulTransactions || 0
                        ),

                    totalAmount:
                        Number(
                            item.totalAmount || 0
                        )

                })
            );


        // =====================================================
        // PAYMENT TYPE CHART
        // =====================================================

        const paymentTypeChart =
            paymentTypeDistribution.map(
                item => ({

                    paymentType:
                        item.payment_type,

                    totalTransactions:
                        Number(
                            item.totalTransactions || 0
                        ),

                    successfulTransactions:
                        Number(
                            item.successfulTransactions || 0
                        ),

                    totalAmount:
                        Number(
                            item.totalAmount || 0
                        )

                })
            );


        // =====================================================
        // TRANSACTIONS
        // =====================================================
        //
        // Only used for export.
        //
        // Normal daily report:
        // transactions = []
        //
        // Export:
        // includeTransactions = true
        //

        let transactions = [];


        if (includeTransactions) {

            transactions =
                await getExportTransactions({

                    startDate:
                        date,

                    endDate:
                        date,

                    merchantId

                });

        }


        // =====================================================
        // FINAL RESPONSE
        // =====================================================

        return {

            summary:
                dashboardCards,

            charts: {

                hourlyChart,

                paymentMethodChart,

                paymentTypeChart

            },

            transactions

        };

    } catch (error) {

        throw error;

    }

};


/**
 * ============================================================
 * DAILY TRANSACTIONS SERVICE
 * ============================================================
 *
 * GET /admin/reports/daily/transactions
 *
 * Supports:
 * - Date
 * - Merchant
 * - Payment method
 * - Payment type
 * - Status
 * - Search
 * - Pagination
 */

const getDailyTransactionsService = async (
    filters
) => {

    try {

        const {

            date,

            merchantId,

            paymentMethod,

            paymentType,

            status,

            search,

            page = 1,

            limit = 20

        } = filters;


        // =====================================================
        // NORMALIZE PAGINATION
        // =====================================================

        const currentPage =
            Math.max(
                Number(page) || 1,
                1
            );


        const currentLimit =
            Math.min(
                Math.max(
                    Number(limit) || 20,
                    1
                ),
                100
            );


        // =====================================================
        // FETCH PAGINATED TRANSACTIONS
        // =====================================================

        const transactions =
            await getDailyTransactions({

                date,

                merchantId,

                paymentMethod,

                paymentType,

                status,

                search,

                page:
                    currentPage,

                limit:
                    currentLimit

            });


        // =====================================================
        // FETCH ACTUAL TOTAL COUNT
        // =====================================================
        //
        // IMPORTANT:
        //
        // Do NOT use:
        //
        // transactions.length
        //
        // because that only gives the number of
        // records on the current page.
        //

        const totalRecords =
            await getDailyTransactionsCount({

                date,

                merchantId,

                paymentMethod,

                paymentType,

                status,

                search

            });


        // =====================================================
        // FORMAT TRANSACTIONS
        // =====================================================

        const formattedTransactions =
            transactions.map(
                transaction => ({

                    transactionId:
                        transaction.transaction_id,

                    orderId:
                        transaction.order_id,

                    merchantName:
                        transaction.merchant_name,

                    businessName:
                        transaction.business_name,

                    customerName:
                        transaction.customer_name,

                    customerEmail:
                        transaction.customer_email,

                    amount:
                        Number(
                            transaction.amount || 0
                        ),

                    gatewayFee:
                        Number(
                            transaction.gateway_fee || 0
                        ),

                    currency:
                        transaction.currency,

                    paymentMethod:
                        transaction.payment_method,

                    paymentType:
                        transaction.payment_type,

                    status:
                        transaction.status,

                    createdAt:
                        transaction.created_at

                })
            );


        // =====================================================
        // PAGINATION CALCULATION
        // =====================================================

        const totalPages =
            totalRecords === 0
                ? 0
                : Math.ceil(
                    totalRecords /
                    currentLimit
                );


        const hasNextPage =
            currentPage < totalPages;


        const hasPreviousPage =
            currentPage > 1 &&
            totalPages > 0;


        // =====================================================
        // FINAL RESPONSE
        // =====================================================

        return {

            page:
                currentPage,

            limit:
                currentLimit,

            totalRecords:
                Number(totalRecords),

            totalPages,

            hasNextPage,

            hasPreviousPage,

            transactions:
                formattedTransactions

        };

    } catch (error) {

        throw error;

    }

};


/**
 * ============================================================
 * SEARCH DAILY TRANSACTIONS
 * ============================================================
 *
 * GET /admin/reports/daily/search
 *
 * Search is handled by the same transaction query.
 */

const searchDailyTransactionsService = async (
    filters
) => {

    try {

        const result =
            await getDailyTransactionsService(
                filters
            );


        return result;

    } catch (error) {

        throw error;

    }

};


/**
 * ============================================================
 * FILTER DAILY TRANSACTIONS
 * ============================================================
 *
 * GET /admin/reports/daily/filter
 *
 * Filters:
 * - Merchant
 * - Status
 * - Payment Method
 * - Payment Type
 * - Search
 * - Date
 */

const filterDailyTransactionsService = async (
    filters
) => {

    try {

        const result =
            await getDailyTransactionsService(
                filters
            );


        return result;

    } catch (error) {

        throw error;

    }

};


/**
 * ============================================================
 * EXPORT DAILY REPORT SERVICE
 * ============================================================
 *
 * POST /admin/reports/daily/export
 *
 * Formats:
 * - CSV
 * - EXCEL
 * - PDF
 */

const exportDailyReportService = async (
    filters = {}
) => {

    try {

        const {

            date,

            merchantId,

            format

        } = filters;


        // =====================================================
        // GET COMPLETE REPORT
        // =====================================================

        const report =
            await getDailyReportService(

                {

                    date,

                    merchantId

                },

                true

            );


        // =====================================================
        // NO TRANSACTIONS
        // =====================================================

        if (
            !report.transactions ||
            !report.transactions.length
        ) {

            return {

                success: false,

                message:
                    "No transactions found."

            };

        }


        // =====================================================
        // EXPORT HEADERS
        // =====================================================

        const headers = [

            {

                id:
                    "transaction_id",

                title:
                    "Transaction ID"

            },

            {

                id:
                    "order_id",

                title:
                    "Order ID"

            },

            {

                id:
                    "merchant_name",

                title:
                    "Merchant"

            },

            {

                id:
                    "business_name",

                title:
                    "Business"

            },

            {

                id:
                    "customer_name",

                title:
                    "Customer"

            },

            {

                id:
                    "customer_email",

                title:
                    "Customer Email"

            },

            {

                id:
                    "amount",

                title:
                    "Amount"

            },

            {

                id:
                    "gateway_fee",

                title:
                    "Gateway Fee"

            },

            {

                id:
                    "currency",

                title:
                    "Currency"

            },

            {

                id:
                    "payment_method",

                title:
                    "Payment Method"

            },

            {

                id:
                    "payment_type",

                title:
                    "Payment Type"

            },

            {

                id:
                    "status",

                title:
                    "Status"

            },

            {

                id:
                    "provider_payment_id",

                title:
                    "Gateway Payment ID"

            },

            {

                id:
                    "created_at",

                title:
                    "Created At"

            }

        ];


        // =====================================================
        // VALIDATE FORMAT
        // =====================================================

        const exportFormat =
            String(format || "")
                .toUpperCase();


        // =====================================================
        // CSV
        // =====================================================

        if (
            exportFormat === "CSV"
        ) {

            return await exportCSV({

                fileName:
                    "daily_report",

                headers,

                records:
                    report.transactions

            });

        }


        // =====================================================
        // EXCEL
        // =====================================================

        if (
            exportFormat === "EXCEL"
        ) {

            return await exportExcel({

                fileName:
                    "daily_report",

                sheetName:
                    "Daily Report",

                columns:
                    headers.map(
                        header => ({

                            header:
                                header.title,

                            key:
                                header.id

                        })
                    ),

                records:
                    report.transactions

            });

        }


        // =====================================================
        // PDF
        // =====================================================

        if (
            exportFormat === "PDF"
        ) {

            return await exportPDF({

                fileName:
                    "daily_report",

                title:
                    "Daily Transaction Report",

                summary:
                    report.summary,

                headers,

                records:
                    report.transactions,

                filters: {

                    date,

                    merchantId

                },

                generatedBy:
                    "Admin"

            });

        }


        // =====================================================
        // INVALID FORMAT
        // =====================================================

        throw new Error(
            "Invalid export format."
        );

    } catch (error) {

        throw error;

    }

};


/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {

    getDailyReportService,

    getDailyTransactionsService,

    searchDailyTransactionsService,

    filterDailyTransactionsService,

    exportDailyReportService

};
