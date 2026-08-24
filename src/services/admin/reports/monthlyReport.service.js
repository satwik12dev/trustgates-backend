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

    const {
        month,
        year,
        merchantId,
        paymentMethod,
        paymentType,
        status
    } = filters;

    const [
        summary,
        revenueTrend,
        transactionTrend,
        refundTrend
    ] = await Promise.all([

        getMonthlySummary({
            month,
            year,
            merchantId,
            paymentMethod,
            paymentType,
            status
        }),

        getMonthlyRevenueTrend({
            month,
            year,
            merchantId,
            paymentMethod,
            paymentType,
            status
        }),

        getMonthlyTransactionTrend({
            month,
            year,
            merchantId,
            paymentMethod,
            paymentType,
            status
        }),

        getMonthlyRefundTrend({
            month,
            year,
            merchantId
        })

    ]);

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

    return {

        summary: {

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

        },

        charts: {

            revenueChart:
                revenueTrend.map(item => ({

                    day:
                        Number(item.day),

                    revenue:
                        Number(item.revenue || 0),

                    gatewayFee:
                        Number(item.gatewayFee || 0),

                    totalTransactions:
                        Number(
                            item.totalTransactions || 0
                        ),

                    successfulTransactions:
                        Number(
                            item.successfulTransactions || 0
                        )

                })),

            transactionChart:
                transactionTrend.map(item => ({

                    day:
                        Number(item.day),

                    totalTransactions:
                        Number(
                            item.totalTransactions || 0
                        ),

                    successful:
                        Number(
                            item.successful || 0
                        ),

                    created:
                        Number(
                            item.created || 0
                        ),

                    failed:
                        Number(
                            item.failed || 0
                        ),

                    pending:
                        Number(
                            item.pending || 0
                        ),

                    refunded:
                        Number(
                            item.refunded || 0
                        ),

                    chargeback:
                        Number(
                            item.chargeback || 0
                        )

                })),

            refundChart:
    refundTrend.map(item => ({

        day:
            Number(item.day),

        totalRefunds:
            Number(
                item.totalRefunds || 0
            ),

        refundAmount:
            Number(
                item.refundAmount || 0
            ),

        refundFee:
            Number(
                item.refundFee || 0
            ),

        totalDebitAmount:
            Number(
                item.totalDebitAmount || 0
            )

    }))

        }

    };
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
 * EXPORTS
 * ============================================================
 */

module.exports = {

    getMonthlyReportService,

    getTopMerchantsService,

    getMonthlyAnalyticsService,

    getMerchantPerformanceService,

    getMonthlyDashboardService,

};