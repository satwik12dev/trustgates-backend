const {

    getMerchantSummary,
    getMerchantRevenueTrend,
    getMerchantPaymentMethods,
    getMerchantSettlementSummary,
    getMerchantRefundSummary

} = require("../../../utils/admin/reports/reportQueries");
const {
    getMerchantRecentTransactions
} = require("../../../utils/admin/reports/reportQueries");


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
 * MERCHANT REPORT
 * ============================================================
 */

const getMerchantReportService = async (filters) => {

    try {

        const {

            merchantId,

            startDate,

            endDate

        } = filters;


        // =====================================================
        // Merchant Summary
        // =====================================================

        const merchantSummary = await getMerchantSummary({

            merchantId,

            startDate,

            endDate

        });
        // =====================================================
        // Revenue Trend
        // =====================================================

        const revenueTrend = await getMerchantRevenueTrend({

            merchantId,

            startDate,

            endDate

        });


        // =====================================================
        // Payment Method Distribution
        // =====================================================

        const paymentMethods = await getMerchantPaymentMethods({

            merchantId,

            startDate,

            endDate

        });


        // =====================================================
        // Dashboard Summary
        // =====================================================

        const totalTransactions =
            Number(merchantSummary.totalTransactions || 0);

        const successfulTransactions =
            Number(merchantSummary.successfulTransactions || 0);

        const failedTransactions =
            Number(merchantSummary.failedTransactions || 0);

        const pendingTransactions =
            Number(merchantSummary.pendingTransactions || 0);

        const totalRevenue =
            Number(merchantSummary.totalRevenue || 0);

        const gatewayFee =
            Number(merchantSummary.totalGatewayFee || 0);

        const averageTransactionAmount =
            Number(merchantSummary.averageTransactionAmount || 0);

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


        const summary = {

            merchantId: merchantSummary.merchant_id,

            merchantName: merchantSummary.merchant_name,

            businessName: merchantSummary.business_name,

            merchantCode: merchantSummary.merchant_code,

            email: merchantSummary.email,

            phone: merchantSummary.phone,

            website: merchantSummary.website,

            accountStatus: merchantSummary.account_status,

            kycStatus: merchantSummary.kyc_status,

            totalTransactions,

            successfulTransactions,

            failedTransactions,

            pendingTransactions,

            totalRevenue,

            gatewayFee,


            averageTransactionAmount,

            successRate

        };


        // =====================================================
        // Revenue Chart
        // =====================================================

        const revenueChart = revenueTrend.map(item => ({

            date: item.reportDate,

            totalTransactions:
                Number(item.totalTransactions),

            revenue:
                Number(item.revenue),

            gatewayFee:
                Number(item.gatewayFee)

        }));



        // =====================================================
        // Payment Method Chart
        // =====================================================

        const paymentMethodChart =
            paymentMethods.map(item => ({

                paymentMethod:
                    item.payment_method,

                totalTransactions:
                    Number(item.totalTransactions),

                totalAmount:
                    Number(item.totalAmount),

                gatewayFee:
                    Number(item.gatewayFee)

            }));
        // =====================================================
        // Settlement Summary
        // =====================================================\
        const formattedStartDate =
    startDate instanceof Date
        ? startDate.toISOString().split("T")[0]
        : startDate;

const formattedEndDate =
    endDate instanceof Date
        ? endDate.toISOString().split("T")[0]
        : endDate;

        const settlementSummary =
    await getMerchantSettlementSummary({

        merchantId,

        startDate: formattedStartDate,

        endDate: formattedEndDate

    });


        // =====================================================
        // Refund Summary
        // =====================================================

        const refundSummary =
    await getMerchantRefundSummary({

        merchantId,

        startDate: formattedStartDate,

        endDate: formattedEndDate

    });


        // =====================================================
        // Settlement Object
        // =====================================================

        const settlements = {

            totalSettlements:
                Number(settlementSummary.totalSettlements || 0),

            grossAmount:
                Number(settlementSummary.grossAmount || 0),

            gatewayFee:
                Number(settlementSummary.gatewayFee || 0),

            gst:
                Number(settlementSummary.gst || 0),

            tds:
                Number(settlementSummary.tds || 0),

            netAmount:
                Number(settlementSummary.netAmount || 0),

            settledCount:
                Number(settlementSummary.settledCount || 0),

            processingCount:
                Number(settlementSummary.processingCount || 0),

            pendingCount:
                Number(settlementSummary.pendingCount || 0)

        };


        // =====================================================
        // Refund Object
        // =====================================================

        const refunds = {

            totalRefunds:
                Number(refundSummary.totalRefunds || 0),

            refundAmount:
                Number(refundSummary.refundAmount || 0),

            processedRefunds:
                Number(refundSummary.processedRefunds || 0),

            failedRefunds:
                Number(refundSummary.failedRefunds || 0),

            pendingRefunds:
                Number(refundSummary.pendingRefunds || 0)

        };


        // =====================================================
        // Final Response
        // =====================================================

        return {

            summary,

            settlements,

            refunds,

            charts: {

                revenueChart,

                paymentMethodChart

            }

        };

    } catch (error) {

        throw error;

    }

};


/**
 * ============================================================
 * MERCHANT RECENT TRANSACTIONS
 * ============================================================
 */

const getMerchantRecentTransactionsService = async (filters) => {

    try {

        const {

            merchantId,

            page = 1,

            limit = 20

        } = filters;

        const transactions =
            await getMerchantRecentTransactions({

                merchantId,

                page,

                limit

            });

        const formattedTransactions =
            transactions.map(transaction => ({

                transactionId:
                    transaction.transaction_id,

                orderId:
                    transaction.order_id,

                providerPaymentId:
                    transaction.provider_payment_id,

                customerName:
                    transaction.customer_name,

                customerEmail:
                    transaction.customer_email,

                amount:
                    Number(transaction.amount),

                gatewayFee:
                    Number(transaction.gateway_fee),

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

        return {

            page: Number(page),

            limit: Number(limit),

            totalRecords:
                formattedTransactions.length,

            transactions:
                formattedTransactions

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

        const report =
            await getMerchantReportService(filters);

        const summary = report.summary;

        const settlements = report.settlements;

        const refunds = report.refunds;

        const settlementRate =
            settlements.totalSettlements === 0
                ? 0
                : Number(
                    (
                        settlements.settledCount /
                        settlements.totalSettlements *
                        100
                    ).toFixed(2)
                );

        const refundRate =
            summary.totalTransactions === 0
                ? 0
                : Number(
                    (
                        refunds.totalRefunds /
                        summary.totalTransactions *
                        100
                    ).toFixed(2)
                );

        const gatewayFeePercentage =
            summary.totalRevenue === 0
                ? 0
                : Number(
                    (
                        summary.gatewayFee /
                        summary.totalRevenue *
                        100
                    ).toFixed(2)
                );

        return {

            merchant: {

                merchantId:
                    summary.merchantId,

                merchantName:
                    summary.merchantName,

                businessName:
                    summary.businessName

            },

            performance: {

                successRate:
                    summary.successRate,

                settlementRate,

                refundRate,

                gatewayFeePercentage,

                averageTransactionAmount:
                    summary.averageTransactionAmount

            },

            financials: {

                totalRevenue:
                    summary.totalRevenue,

                gatewayFee:
                    summary.gatewayFee,

                netSettlement:
                    settlements.netAmount,

                refundAmount:
                    refunds.refundAmount

            }

        };

    } catch (error) {

        throw error;

    }

};

/**
 * ============================================================
 * MERCHANT DASHBOARD
 * ============================================================
 */

const getMerchantDashboardService = async (filters) => {

    try {

        const [

            report,

            performance,

            recentTransactions

        ] = await Promise.all([

            getMerchantReportService(filters),

            getMerchantPerformanceService(filters),

            getMerchantRecentTransactionsService({

                merchantId: filters.merchantId,

                page: filters.page || 1,

                limit: filters.limit || 10

            })

        ]);

        return {

            merchant: report.summary,

            settlements: report.settlements,

            refunds: report.refunds,

            charts: report.charts,

            performance,

            recentTransactions

        };

    } catch (error) {

        throw error;

    }

};



/**
 * ============================================================
 * MERCHANT ANALYTICS
 * ============================================================
 */

const getMerchantAnalyticsService = async (filters) => {

    try {

        const dashboard =
            await getMerchantDashboardService(filters);

        const summary = dashboard.merchant;

        const settlements = dashboard.settlements;

        const refunds = dashboard.refunds;

        return {

            overview: {

                merchantId: summary.merchantId,

                merchantName: summary.merchantName,

                businessName: summary.businessName,

                totalRevenue: summary.totalRevenue,

                totalTransactions:
                    summary.totalTransactions,

                successRate:
                    summary.successRate

            },

            settlements,

            refunds,

            charts: dashboard.charts,

            performance:
                dashboard.performance.performance,

            financials:
                dashboard.performance.financials

        };

    } catch (error) {

        throw error;

    }

};


/**
 * ============================================================
 * EXPORT MERCHANT REPORT
 * ============================================================
 */

const exportMerchantReportService = async (filters) => {

    try {

        const {

            merchantId,

            startDate,

            endDate,

            format

        } = filters;

        const records = await getExportTransactions({

            merchantId,

            startDate,

            endDate

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

            { id: "merchant_name", title: "Merchant Name" },

            { id: "business_name", title: "Business Name" },

            { id: "customer_name", title: "Customer Name" },

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

                    fileName:
                        `merchant_report_${merchantId}`,

                    headers,

                    records

                });


            case "EXCEL":

                return await exportExcel({

                    fileName:
                        `merchant_report_${merchantId}`,

                    sheetName:
                        "Merchant Report",

                    columns: headers.map(header => ({

                        header: header.title,

                        key: header.id

                    })),

                    records

                });


            case "PDF":

                return await exportPDF({

                    fileName:
                        `merchant_report_${merchantId}`,

                    title:
                        `Merchant Report (${merchantId})`,

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
 * DOWNLOAD MERCHANT REPORT
 * ============================================================
 */

const downloadMerchantReportService = async (filters) => {

    try {

        const result = await exportMerchantReportService(filters);

        return {

            success: true,

            message: "Merchant report generated successfully.",

            fileName: result.fileName,

            filePath: result.filePath,

            downloadPath: result.downloadPath

        };

    } catch (error) {

        throw error;

    }

};


/**
 * ============================================================
 * GET MERCHANT REPORT BY FORMAT
 * ============================================================
 */

const getMerchantReportByFormatService = async (filters) => {

    try {

        const { format } = filters;

        if (!format) {

            throw new Error("Format is required.");

        }

        const supportedFormats = [
            "CSV",
            "EXCEL",
            "PDF"
        ];

        if (!supportedFormats.includes(format.toUpperCase())) {

            throw new Error("Unsupported report format.");

        }

        return await exportMerchantReportService(filters);

    } catch (error) {

        throw error;

    }

};


/**
 * ============================================================
 * FINAL EXPORTS
 * ============================================================
 */

module.exports = {

    // Merchant Report
    getMerchantReportService,

    // Transactions
    getMerchantRecentTransactionsService,

    // Analytics
    getMerchantPerformanceService,
    getMerchantDashboardService,
    getMerchantAnalyticsService,

    // Export
    exportMerchantReportService,
    downloadMerchantReportService,
    getMerchantReportByFormatService

};