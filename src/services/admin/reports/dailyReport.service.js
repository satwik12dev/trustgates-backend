const {
    getDailySummary,
    getHourlyTransactions,
    getPaymentMethodDistribution,
    getPaymentTypeDistribution
} = require("../../../utils/admin/reports/reportQueries");
const { getExportTransactions } = require("../../../utils/admin/reports/reportQueries");
const {
    getDailyTransactions
} = require("../../../utils/admin/reports/reportQueries");

const { exportCSV } = require("../../../utils/admin/reports/csvExport");
const { exportExcel } = require("../../../utils/admin/reports/excelExport");
const { exportPDF } = require("../../../utils/admin/reports/pdfExport");

/**
 * ============================================================
 * DAILY REPORT
 * ============================================================
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
        // Summary
        // =====================================================

        const summary = await getDailySummary({
            date,
            merchantId,
            paymentMethod,
            paymentType,
            status
        });

        // =====================================================
        // Hourly Analytics
        // =====================================================

        const hourlyTransactions = await getHourlyTransactions({
            date,
            merchantId
        });

        // =====================================================
        // Payment Method Distribution
        // =====================================================

        const paymentMethodDistribution =
            await getPaymentMethodDistribution({
                date,
                merchantId
            });

        // =====================================================
        // Payment Type Distribution
        // =====================================================

        const paymentTypeDistribution =
            await getPaymentTypeDistribution({
                date,
                merchantId
            });

        // =====================================================
        // Success Rate
        // =====================================================

        const totalTransactions =
            Number(summary.totalTransactions || 0);

        const successfulTransactions =
            Number(summary.successfulTransactions || 0);

        const successRate =
            totalTransactions === 0
                ? 0
                : Number(
                    (
                        (successfulTransactions /
                            totalTransactions) *
                        100
                    ).toFixed(2)
                );

        // =====================================================
        // Dashboard Cards
        // =====================================================

        const dashboardCards = {

            totalTransactions,

            successfulTransactions,

            failedTransactions:
                Number(summary.failedTransactions || 0),

            pendingTransactions:
                Number(summary.pendingTransactions || 0),

            chargebackTransactions:
                Number(summary.chargebackTransactions || 0),

            totalRevenue:
                Number(summary.totalRevenue || 0),

            totalGatewayFee:
                Number(summary.totalGatewayFee || 0),

            averageTransactionAmount:
                Number(summary.averageTransactionAmount || 0),

            successRate

        };

        // =====================================================
        // Hourly Chart
        // =====================================================

        const hourlyChart = [];

        for (let hour = 0; hour < 24; hour++) {

            const transaction = hourlyTransactions.find(
                item => Number(item.hour) === hour
            );

            hourlyChart.push({

                hour: `${hour}:00`,

                totalTransactions:
                    transaction
                        ? Number(transaction.totalTransactions)
                        : 0,

                successfulTransactions:
                    transaction
                        ? Number(transaction.successfulTransactions)
                        : 0,

                totalAmount:
                    transaction
                        ? Number(transaction.totalAmount)
                        : 0

            });

        }

        // =====================================================
        // Payment Method Chart
        // =====================================================

        const paymentMethodChart =
            paymentMethodDistribution.map(item => ({

                paymentMethod: item.payment_method,

                totalTransactions:
                    Number(item.totalTransactions),

                successfulTransactions:
                    Number(item.successfulTransactions),

                totalAmount:
                    Number(item.totalAmount)

            }));

        // =====================================================
        // Payment Type Chart
        // =====================================================

        const paymentTypeChart =
            paymentTypeDistribution.map(item => ({

                paymentType: item.payment_type,

                totalTransactions:
                    Number(item.totalTransactions),

                successfulTransactions:
                    Number(item.successfulTransactions),

                totalAmount:
                    Number(item.totalAmount)

            }));
        // =====================================================
        // EXPORT TRANSACTIONS
        // =====================================================

        let transactions = [];

        if (includeTransactions) {

            transactions = await getExportTransactions({

                startDate: date,

                endDate: date,

                merchantId

            });

        }

        // =====================================================
        // Final Response
        // =====================================================

        return {

            summary: dashboardCards,

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
 * DAILY TRANSACTIONS
 * ============================================================
 */

const getDailyTransactionsService = async (filters) => {

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


        const currentPage =
            Math.max(Number(page) || 1, 1);


        const currentLimit =
            Math.min(
                Math.max(Number(limit) || 20, 1),
                100
            );


        // =====================================================
        // GET PAGINATED TRANSACTIONS
        // =====================================================

        const transactions =
            await getDailyTransactions({

                date,

                merchantId,

                paymentMethod,

                paymentType,

                status,

                search,

                page: currentPage,

                limit: currentLimit

            });


        // =====================================================
        // GET ACTUAL TOTAL RECORDS
        // =====================================================

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
            transactions.map(transaction => ({

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
                    Number(transaction.amount),

                gatewayFee:
                    Number(transaction.gateway_fee || 0),

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

            }));


        // =====================================================
        // PAGINATION
        // =====================================================

        const totalPages =
            Math.ceil(
                totalRecords / currentLimit
            );


        return {

            page: currentPage,

            limit: currentLimit,

            totalRecords,

            totalPages,

            hasNextPage:
                currentPage < totalPages,

            hasPreviousPage:
                currentPage > 1,

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
 */

const searchDailyTransactionsService = async (filters) => {

    try {

        const result = await getDailyTransactionsService(filters);

        return result;

    } catch (error) {

        throw error;

    }

};


/**
 * ============================================================
 * FILTER DAILY TRANSACTIONS
 * ============================================================
 */

const filterDailyTransactionsService = async (filters) => {

    try {

        const result = await getDailyTransactionsService(filters);

        return result;

    } catch (error) {

        throw error;

    }

};

/**
 * ============================================================
 * EXPORT DAILY REPORT
 * ============================================================
 */
const exportDailyReportService = async (filters = {}) => {

    try {

        const {

            date,

            merchantId,

            format

        } = filters;

        // ============================================
        // GET COMPLETE REPORT
        // ============================================

        const report = await getDailyReportService(

            {

                date,

                merchantId

            },

            true

        );

        if (!report.transactions.length) {

            return {

                success: false,

                message: "No transactions found."

            };

        }

        const headers = [

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

        switch (format.toUpperCase()) {

            case "CSV":

                return await exportCSV({

                    fileName: "daily_report",

                    headers,

                    records: report.transactions

                });

            case "EXCEL":

                return await exportExcel({

                    fileName: "daily_report",

                    sheetName: "Daily Report",

                    columns: headers.map(h => ({

                        header: h.title,

                        key: h.id

                    })),

                    records: report.transactions

                });

            case "PDF":

                return await exportPDF({

                    fileName: "daily_report",

                    title: "Daily Transaction Report",

                    summary: report.summary,

                    headers,

                    records: report.transactions,

                    filters: {

                        date,

                        merchantId

                    },

                    generatedBy: "Admin"

                });

            default:

                throw new Error(

                    "Invalid export format."

                );

        }

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
