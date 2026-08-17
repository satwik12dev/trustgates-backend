const {
    getMonthlySummary,
    getMonthlyRevenueTrend,
    getMonthlyTransactionTrend,
    getMonthlyRefundTrend
} = require("../../../utils/admin/reports/reportQueries");

const {
    getTopMerchants
} = require("../../../utils/admin/reports/reportQueries");;



const {
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
 * MONTHLY REPORT
 * ============================================================
 */

const getMonthlyReportService = async (filters = {}) => {

    try {

        const {

            month,
            year,
            merchantId,
            paymentMethod,
            paymentType

        } = filters || {};

        // =====================================================
        // Monthly Summary
        // =====================================================

        const summary = await getMonthlySummary({

            month,
            year,
            merchantId,
            paymentMethod,
            paymentType

        });

        // =====================================================
        // Revenue Trend
        // =====================================================

        const revenueTrend =
            await getMonthlyRevenueTrend({

                month,
                year,
                merchantId

            });

        // =====================================================
        // Transaction Trend
        // =====================================================

        const transactionTrend =
            await getMonthlyTransactionTrend({

                month,
                year,
                merchantId

            });

        // =====================================================
        // Refund Trend
        // =====================================================

        const refundTrend =
            await getMonthlyRefundTrend({

                month,
                year,
                merchantId

            });

        // =====================================================
        // Dashboard Summary
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
                        successfulTransactions /
                        totalTransactions *
                        100
                    ).toFixed(2)
                );

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
        // Revenue Chart
        // =====================================================

        const revenueChart = revenueTrend.map(item => ({

            day: Number(item.day),

            revenue: Number(item.revenue),

            totalTransactions:
                Number(item.totalTransactions)

        }));

        // =====================================================
        // Transaction Chart
        // =====================================================

        const transactionChart = transactionTrend.map(item => ({

            day: Number(item.day),

            totalTransactions:
                Number(item.totalTransactions),

            successful:
                Number(item.successful),

            failed:
                Number(item.failed),

            pending:
                Number(item.pending)

        }));

        // =====================================================
        // Refund Chart
        // =====================================================

        const refundChart = refundTrend.map(item => ({

            day: Number(item.day),

            totalRefunds:
                Number(item.totalRefunds),

            refundAmount:
                Number(item.refundAmount)

        }));

        // =====================================================
        // Response
        // =====================================================

        return {

            summary: dashboardCards,

            charts: {

                revenueChart,

                transactionChart,

                refundChart

            }

        };

    } catch (error) {

        throw error;

    }

};

/**
 * ============================================================
 * TOP MERCHANTS
 * ============================================================
 */

const getTopMerchantsService = async (filters) => {

    try {

        const {
            month,
            year,
            limit = 10
        } = filters;

        const merchants = await getTopMerchants({
            month,
            year,
            limit
        });

        return merchants.map((merchant, index) => ({

            rank: index + 1,

            merchantId: merchant.merchant_id,

            merchantName: merchant.merchant_name,

            businessName: merchant.business_name,

            merchantCode: merchant.merchant_code,

            totalTransactions:
                Number(merchant.totalTransactions),

            revenue:
                Number(merchant.revenue),

            gatewayFee:
                Number(merchant.gatewayFee)

        }));

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * MONTHLY ANALYTICS
 * ============================================================
 */

const getMonthlyAnalyticsService = async (filters) => {

    try {

        const summary = await getMonthlyReportService(filters);

        const topMerchants =
            await getTopMerchantsService(filters);

        return {

            summary: summary.summary,

            charts: summary.charts,

            topMerchants

        };

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * MERCHANT PERFORMANCE
 * ============================================================
 */

const getMerchantPerformanceService = async (filters) => {

    try {

        const merchants =
            await getTopMerchantsService(filters);

        const performance = merchants.map(merchant => {

            const revenue = merchant.revenue;
            const fee = merchant.gatewayFee;

            const feePercentage =
                revenue === 0
                    ? 0
                    : Number(
                        ((fee / revenue) * 100).toFixed(2)
                    );

            return {

                ...merchant,

                feePercentage

            };

        });

        return performance;

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * MONTHLY DASHBOARD
 * ============================================================
 */

const getMonthlyDashboardService = async (filters) => {

    try {

        const [

            analytics,

            merchantPerformance

        ] = await Promise.all([

            getMonthlyAnalyticsService(filters),

            getMerchantPerformanceService(filters)

        ]);

        return {

            summary: analytics.summary,

            charts: analytics.charts,

            topMerchants: analytics.topMerchants,

            merchantPerformance

        };

    } catch (error) {

        throw error;

    }

};

/**
 * ============================================================
 * EXPORT MONTHLY REPORT
 * ============================================================
 */

const exportMonthlyReportService = async (filters = {}) => {

    try {

        const {

            month,

            year,

            merchantId,

            format = "CSV"

        } = filters || {};

        if (!month || !year) {
            throw new Error("Month and year are required to export monthly report.");
        }

        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

        const lastDay = new Date(year, month, 0).getDate();

        const endDate =
            `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

        const records = await getExportTransactions({

            startDate,

            endDate,

            merchantId

        });

        if (!records.length) {

            return {

                success: false,

                message: "No transactions found."

            };

        }

        const headers = [

            { id: "transaction_id", title: "Transaction ID" },

            { id: "order_id", title: "Order ID" },

            { id: "merchant_name", title: "Merchant" },

            { id: "business_name", title: "Business" },

            { id: "customer_name", title: "Customer" },

            { id: "customer_email", title: "Customer Email" },

            { id: "amount", title: "Amount" },

            { id: "gateway_fee", title: "Gateway Fee" },

            { id: "currency", title: "Currency" },

            { id: "payment_method", title: "Payment Method" },

            { id: "payment_type", title: "Payment Type" },

            { id: "status", title: "Status" },

            { id: "provider_payment_id", title: "Gateway Payment ID" },

            { id: "created_at", title: "Created At" }

        ];

        switch (format.toUpperCase()) {

            case "CSV":

                return await exportCSV({

                    fileName: `monthly_report_${month}_${year}`,

                    headers,

                    records

                });

            case "EXCEL":

                return await exportExcel({

                    fileName: `monthly_report_${month}_${year}`,

                    sheetName: "Monthly Report",

                    columns: headers.map(header => ({

                        header: header.title,

                        key: header.id

                    })),

                    records

                });

            case "PDF":

                return await exportPDF({

                    fileName: `monthly_report_${month}_${year}`,

                    title: `Monthly Report (${month}/${year})`,

                    headers,

                    records

                });

            default:

                throw new Error("Invalid export format.");

        }

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * DOWNLOAD MONTHLY REPORT
 * ============================================================
 */

const downloadMonthlyReportService = async (filters) => {

    return await exportMonthlyReportService(filters);

};



/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {

    getMonthlyReportService,

    getTopMerchantsService,

    getMonthlyAnalyticsService,

    getMerchantPerformanceService,

    getMonthlyDashboardService,

    exportMonthlyReportService,

    downloadMonthlyReportService

};