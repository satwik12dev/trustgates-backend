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


const getDailyReportService = async (
    filters,
    includeTransactions = false
) => {

    const {
        date,
        merchantId = null,
        paymentMethod = null,
        paymentType = null,
        status = null
    } = filters;

    if (!date) {
        throw new Error("Report date is required.");
    }

    const [
        summary,
        hourlyTransactions,
        paymentMethodDistribution,
        paymentTypeDistribution
    ] = await Promise.all([

        getDailySummary({
            date,
            merchantId,
            paymentMethod,
            paymentType,
            status
        }),

        getHourlyTransactions({
            date,
            merchantId,
            paymentMethod,
            paymentType,
            status
        }),

        getPaymentMethodDistribution({
            date,
            merchantId,
            paymentType,
            status
        }),

        getPaymentTypeDistribution({
            date,
            merchantId,
            paymentMethod,
            status
        })
    ]);

    const totalTransactions =
        Number(summary?.totalTransactions || 0);

    const successfulTransactions =
        Number(summary?.successfulTransactions || 0);

    const successRate =
        totalTransactions > 0
            ? Number(
                (
                    successfulTransactions /
                    totalTransactions *
                    100
                ).toFixed(2)
            )
            : 0;

    const hourlyChart =
        Array.from(
            { length: 24 },
            (_, hour) => {

                const item =
                    (
                        hourlyTransactions || []
                    ).find(
                        row =>
                            Number(row.hour) === hour ||
                            row.hour === `${hour}:00`
                    );

                return {
                    hour: `${hour}:00`,

                    totalTransactions:
                        Number(
                            item?.totalTransactions || 0
                        ),

                    successfulTransactions:
                        Number(
                            item?.successfulTransactions || 0
                        ),

                    createdTransactions:
                        Number(
                            item?.createdTransactions || 0
                        ),

                    failedTransactions:
                        Number(
                            item?.failedTransactions || 0
                        ),

                    pendingTransactions:
                        Number(
                            item?.pendingTransactions || 0
                        ),

                    refundedTransactions:
                        Number(
                            item?.refundedTransactions || 0
                        ),

                    chargebackTransactions:
                        Number(
                            item?.chargebackTransactions || 0
                        ),

                    totalAmount:
                        Number(
                            item?.totalAmount || 0
                        ),

                    successfulAmount:
                        Number(
                            item?.successfulAmount || 0
                        )
                };
            }
        );

    const paymentMethodChart =
        (
            paymentMethodDistribution || []
        ).map(item => ({

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

            createdTransactions:
                Number(
                    item.createdTransactions || 0
                ),

            failedTransactions:
                Number(
                    item.failedTransactions || 0
                ),

            pendingTransactions:
                Number(
                    item.pendingTransactions || 0
                ),

            refundedTransactions:
                Number(
                    item.refundedTransactions || 0
                ),

            chargebackTransactions:
                Number(
                    item.chargebackTransactions || 0
                ),

            totalAmount:
                Number(
                    item.totalAmount || 0
                ),

            successfulAmount:
                Number(
                    item.successfulAmount || 0
                )
        }));

    const paymentTypeChart =
        (
            paymentTypeDistribution || []
        ).map(item => ({

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

            createdTransactions:
                Number(
                    item.createdTransactions || 0
                ),

            failedTransactions:
                Number(
                    item.failedTransactions || 0
                ),

            pendingTransactions:
                Number(
                    item.pendingTransactions || 0
                ),

            refundedTransactions:
                Number(
                    item.refundedTransactions || 0
                ),

            chargebackTransactions:
                Number(
                    item.chargebackTransactions || 0
                ),

            totalAmount:
                Number(
                    item.totalAmount || 0
                ),

            successfulAmount:
                Number(
                    item.successfulAmount || 0
                )
        }));

    let transactions = [];

    if (includeTransactions) {

        transactions =
            await getExportTransactions({
                startDate: date,
                endDate: date,
                merchantId
            });
    }

    return {

        summary: {
            totalTransactions,

            successfulTransactions,

            createdTransactions:
                Number(
                    summary?.createdTransactions || 0
                ),

            failedTransactions:
                Number(
                    summary?.failedTransactions || 0
                ),

            pendingTransactions:
                Number(
                    summary?.pendingTransactions || 0
                ),

            refundedTransactions:
                Number(
                    summary?.refundedTransactions || 0
                ),

            chargebackTransactions:
                Number(
                    summary?.chargebackTransactions || 0
                ),

            totalRevenue:
                Number(
                    summary?.totalRevenue || 0
                ),

            totalGatewayFee:
                Number(
                    summary?.totalGatewayFee || 0
                ),

            averageTransactionAmount:
                Number(
                    summary?.averageTransactionAmount || 0
                ),

            successRate
        },

        charts: {
            hourlyChart,
            paymentMethodChart,
            paymentTypeChart
        },

        transactions
    };
};


const getDailyTransactionsService = async (
    filters
) => {

    const {
        date,
        merchantId = null,
        paymentMethod = null,
        paymentType = null,
        status = null,
        search = null,
        page = 1,
        limit = 20
    } = filters;

    if (!date) {
        throw new Error("Report date is required.");
    }

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

    const [
        transactions,
        totalRecords
    ] = await Promise.all([

        getDailyTransactions({
            date,
            merchantId,
            paymentMethod,
            paymentType,
            status,
            search,
            page: currentPage,
            limit: currentLimit
        }),

        getDailyTransactionsCount({
            date,
            merchantId,
            paymentMethod,
            paymentType,
            status,
            search
        })
    ]);

    const formattedTransactions =
        (
            transactions || []
        ).map(transaction => ({

            transactionId:
                transaction.transaction_id,

            transactionRef:
                transaction.transaction_ref,

            merchantId:
                transaction.merchant_id,

            merchantName:
                transaction.merchant_name,

            businessName:
                transaction.business_name,

            orderId:
                transaction.order_id,

            gatewayOrderId:
                transaction.gateway_order_id,

            gatewayPaymentId:
                transaction.gateway_payment_id,

            gatewayReference:
                transaction.gateway_reference,

            customerName:
                transaction.customer_name,

            customerEmail:
                transaction.customer_email,

            customerPhone:
                transaction.customer_phone,

            amount:
                Number(
                    transaction.amount || 0
                ),

            merchantFee:
                Number(
                    transaction.merchant_fee || 0
                ),

            gatewayFee:
                Number(
                    transaction.gateway_fee || 0
                ),

            gatewayTax:
                Number(
                    transaction.gateway_tax || 0
                ),

            netAmount:
                Number(
                    transaction.net_amount || 0
                ),

            currency:
                transaction.currency,

            paymentMethod:
                transaction.payment_method,

            paymentType:
                transaction.payment_type,

            status:
                transaction.status,

            completionSource:
                transaction.completion_source,

            settlementStatus:
                transaction.settlement_status,

            createdAt:
                transaction.created_at,

            completedAt:
                transaction.completed_at,

            updatedAt:
                transaction.updated_at
        }));

    const total =
        Number(totalRecords || 0);

    const totalPages =
        total > 0
            ? Math.ceil(
                total /
                currentLimit
            )
            : 0;

    return {

        page: currentPage,

        limit: currentLimit,

        totalRecords: total,

        totalPages,

        hasNextPage:
            currentPage < totalPages,

        hasPreviousPage:
            currentPage > 1,

        transactions:
            formattedTransactions
    };
};


const searchDailyTransactionsService = async (
    filters
) => {

    return getDailyTransactionsService({
        ...filters,
        search: filters.search
    });
};


const filterDailyTransactionsService = async (
    filters
) => {

    return getDailyTransactionsService(
        filters
    );
};


const exportDailyReportService = async (
    filters
) => {

    const {
        date,
        merchantId = null,
        format
    } = filters;

    if (!date) {
        throw new Error("Report date is required.");
    }

    if (!format) {
        throw new Error("Export format is required.");
    }

    const report =
        await getDailyReportService(
            {
                date,
                merchantId
            },
            true
        );

    const normalizedFormat =
        String(format).toUpperCase();

    const headers = [
        {
            id: "transaction_id",
            title: "Transaction ID"
        },
        {
            id: "transaction_ref",
            title: "Transaction Reference"
        },
        {
            id: "merchant_id",
            title: "Merchant ID"
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
            id: "order_id",
            title: "Order ID"
        },
        {
            id: "gateway_order_id",
            title: "Gateway Order ID"
        },
        {
            id: "gateway_payment_id",
            title: "Gateway Payment ID"
        },
        {
            id: "gateway_reference",
            title: "Gateway Reference"
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
            id: "customer_phone",
            title: "Customer Phone"
        },
        {
            id: "amount",
            title: "Amount"
        },
        {
            id: "merchant_fee",
            title: "Merchant Fee"
        },
        {
            id: "gateway_fee",
            title: "Gateway Fee"
        },
        {
            id: "gateway_tax",
            title: "Gateway Tax"
        },
        {
            id: "net_amount",
            title: "Net Amount"
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
            id: "completion_source",
            title: "Completion Source"
        },
        {
            id: "settlement_status",
            title: "Settlement Status"
        },
        {
            id: "created_at",
            title: "Created At"
        },
        {
            id: "completed_at",
            title: "Completed At"
        },
        {
            id: "updated_at",
            title: "Updated At"
        }
    ];

    switch (normalizedFormat) {

        case "CSV":

            return exportCSV({
                fileName: "daily_report",
                headers,
                records:
                    report.transactions
            });

        case "EXCEL":

            return exportExcel({
                fileName: "daily_report",
                sheetName: "Daily Report",

                columns:
                    headers.map(header => ({
                        header: header.title,
                        key: header.id
                    })),

                records:
                    report.transactions
            });

        case "PDF":

            return exportPDF({
                fileName: "daily_report",

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

        default:

            throw new Error(
                "Invalid export format. Use CSV, EXCEL, or PDF."
            );
    }
};


module.exports = {
    getDailyReportService,
    getDailyTransactionsService,
    searchDailyTransactionsService,
    filterDailyTransactionsService,
    exportDailyReportService
};