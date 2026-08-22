const DASHBOARD_QUERIES = require(
    "../../utils/admin/dashboardQueries"
);

const db = require(
    "../../config/pool"
);


// ==========================================================
// Helper: Number Normalizer
// ==========================================================

const toNumber = (value) => {

    return Number(
        value || 0
    );

};


// ==========================================================
// Helper: Date Formatter
// ==========================================================

const formatDate = (date) => {

    if (!date) {
        return null;
    }


    if (typeof date === "string") {

        return date.slice(0, 10);

    }


    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

};


// ==========================================================
// Helper: Next Date
// ==========================================================

const getNextDate = (
    date
) => {

    const [
        year,
        month,
        day
    ] =
        date
            .split("-")
            .map(Number);


    const nextDate =
        new Date(
            year,
            month - 1,
            day + 1
        );


    const nextYear =
        nextDate.getFullYear();

    const nextMonth =
        String(
            nextDate.getMonth() + 1
        ).padStart(2, "0");

    const nextDay =
        String(
            nextDate.getDate()
        ).padStart(2, "0");


    return (
        `${nextYear}-${nextMonth}-${nextDay}`
    );

};


// ==========================================================
// Helper: Current Month Range
// ==========================================================

const getCurrentMonthRange = () => {

    const now =
        new Date();


    const year =
        now.getFullYear();

    const month =
        now.getMonth();


    const startDate =
        `${year}-${String(
            month + 1
        ).padStart(2, "0")}-01`;


    const nextMonthDate =
        new Date(
            year,
            month + 1,
            1
        );


    const endYear =
        nextMonthDate.getFullYear();

    const endMonth =
        String(
            nextMonthDate.getMonth() + 1
        ).padStart(2, "0");


    return {

        startDate:
            `${startDate} 00:00:00`,

        endDate:
            `${endYear}-${endMonth}-01 00:00:00`

    };

};


// ==========================================================
// Helper: Build Date Range
// ==========================================================

const buildDateRange = ({
    date,
    startDate,
    endDate
}) => {

    // ======================================================
    // Specific Date
    // ======================================================

    if (date) {

        const formattedDate =
            formatDate(
                date
            );


        const nextDate =
            getNextDate(
                formattedDate
            );


        return {

            startDate:
                `${formattedDate} 00:00:00`,

            endDate:
                `${nextDate} 00:00:00`

        };

    }


    // ======================================================
    // Custom Range
    // ======================================================

    if (
        startDate &&
        endDate
    ) {

        const formattedStartDate =
            formatDate(
                startDate
            );

        const formattedEndDate =
            formatDate(
                endDate
            );


        const nextDate =
            getNextDate(
                formattedEndDate
            );


        return {

            startDate:
                `${formattedStartDate} 00:00:00`,

            endDate:
                `${nextDate} 00:00:00`

        };

    }


    // ======================================================
    // Default: Today
    // ======================================================

    const now =
        new Date();


    const today =
        formatDate(
            now
        );


    const tomorrow =
        getNextDate(
            today
        );


    return {

        startDate:
            `${today} 00:00:00`,

        endDate:
            `${tomorrow} 00:00:00`

    };

};


// ==========================================================
// Helper: Normalize Dashboard Summary
// ==========================================================

const normalizeSummary = (summary) => {

    const data = summary || {};

    return {

        totalTransactions:
            toNumber(
                data.total_transactions
            ),

        successfulTransactions:
            toNumber(
                data.successful_transactions
            ),

        failedTransactions:
            toNumber(
                data.failed_transactions
            ),

        pendingTransactions:
            toNumber(
                data.pending_transactions
            ),

        createdTransactions:
            toNumber(
                data.created_transactions
            ),

        authorizedTransactions:
            toNumber(
                data.authorized_transactions
            ),

        cancelledTransactions:
            toNumber(
                data.cancelled_transactions
            ),

        refundedTransactions:
            toNumber(
                data.refunded_transactions
            ),

        partiallyRefundedTransactions:
            toNumber(
                data.partially_refunded_transactions
            ),

        chargebackTransactions:
            toNumber(
                data.chargeback_transactions
            )

    };

};


// ==========================================================
// Helper: Normalize Refund
// ==========================================================

const normalizeRefund = (
    refund
) => {

    return {

        refundCount:
            toNumber(
                refund?.refund_count
            )

    };

};


// ==========================================================
// Helper: Normalize Revenue
// ==========================================================

const normalizeRevenue = ({
    todaysRevenue,
    monthlyRevenue
}) => {

    return {

        todaysRevenue:
            toNumber(
                todaysRevenue?.todays_revenue
            ),

        monthlyRevenue:
            toNumber(
                monthlyRevenue?.monthly_revenue
            )

    };

};


// ==========================================================
// Helper: Normalize Wallet
// ==========================================================

const normalizeWallet = ({
    availableBalance,
    settledAmount
}) => {

    return {

        availableBalance:
            toNumber(
                availableBalance?.available_balance
            ),

        settledAmount:
            toNumber(
                settledAmount?.settled_amount
            )

    };

};


// ==========================================================
// Helper: Normalize Top Merchants
// ==========================================================

const normalizeTopMerchants = (merchants) => {

    if (!Array.isArray(merchants)) {
        return [];
    }


    return merchants.map(
        (merchant) => ({

            merchantId:
                merchant.merchant_id,

            businessName:
                merchant.business_name,

            totalTransactions:
                toNumber(
                    merchant.total_transactions
                ),

            successfulTransactions:
                toNumber(
                    merchant.successful_transactions
                ),

            createdTransactions:
                toNumber(
                    merchant.created_transactions
                ),

            pendingTransactions:
                toNumber(
                    merchant.pending_transactions
                ),

            authorizedTransactions:
                toNumber(
                    merchant.authorized_transactions
                ),

            failedTransactions:
                toNumber(
                    merchant.failed_transactions
                ),

            cancelledTransactions:
                toNumber(
                    merchant.cancelled_transactions
                ),

            refundedTransactions:
                toNumber(
                    merchant.refunded_transactions
                ),

            partiallyRefundedTransactions:
                toNumber(
                    merchant.partially_refunded_transactions
                ),

            chargebackTransactions:
                toNumber(
                    merchant.chargeback_transactions
                ),

            revenue:
                toNumber(
                    merchant.revenue
                )

        })
    );

};


// ==========================================================
// GET ADMIN DASHBOARD
// ==========================================================

const getAdminDashboard = async ({
    paymentType,
    merchantId = null,
    date = null,
    startDate = null,
    endDate = null,
    limit = 10
}) => {

    // ==================================================
    // Selected Date Range
    // Used by:
    // - Refund Count
    // - Top Merchants
    // - Transaction Volume
    // - Success Rate
    // ==================================================

    const selectedRange =
        buildDateRange({

            date,

            startDate,

            endDate

        });


    // ==================================================
    // Current Month Range
    // ==================================================

    const monthlyRange =
        getCurrentMonthRange();


    // ==================================================
    // Database Connection
    // ==================================================

    const connection =
        await db.getConnection();


    try {

        // ==================================================
        // DASHBOARD SUMMARY
        // ==================================================
        // Lifetime / overall summary.
        // No payment type filter.
        // No date filter.
        // No merchant filter.
        // ==================================================

        const [
            summaryRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_DASHBOARD_SUMMARY

        );


        // ==================================================
        // REFUND COUNT
        // ==================================================
        // Selected date range.
        // ==================================================

        const [
            refundRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_REFUND_COUNT,

            [

                selectedRange.startDate,

                selectedRange.endDate,

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // TODAY'S REVENUE
        // ==================================================
        // Current day.
        // Payment type + optional merchant.
        // ==================================================

        const todayRange =
            buildDateRange({});


        const [
            todaysRevenueRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_TODAYS_REVENUE,

            [

                paymentType,

                todayRange.startDate,

                todayRange.endDate,

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // MONTHLY REVENUE
        // ==================================================
        // Current calendar month.
        // Payment type + optional merchant.
        // ==================================================

        const [
            monthlyRevenueRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_MONTHLY_REVENUE,

            [

                paymentType,

                monthlyRange.startDate,

                monthlyRange.endDate,

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // AVAILABLE BALANCE
        // ==================================================
        // Current balance.
        // ==================================================

        const [
            availableBalanceRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_AVAILABLE_BALANCE,

            [

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // SETTLED AMOUNT
        // ==================================================
        // Cumulative settled amount.
        // ==================================================

        const [
            settledAmountRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_SETTLED_AMOUNT,

            [

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // TOP MERCHANTS
        // ==================================================
        // Selected payment type + selected date range.
        // ==================================================

        const safeLimit =
            Number(limit) > 0
                ? Math.min(
                    Number(limit),
                    100
                )
                : 10;


        const [
            topMerchantRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_TOP_MERCHANTS,

            [

                paymentType,

                selectedRange.startDate,

                selectedRange.endDate,

                merchantId,

                merchantId,

                safeLimit

            ]

        );


        // ==================================================
        // TRANSACTION VOLUME
        // ==================================================
        // Selected payment type + selected date range.
        // ==================================================

        const [
            transactionVolumeRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_TRANSACTION_VOLUME,

            [

                paymentType,

                selectedRange.startDate,

                selectedRange.endDate,

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // SUCCESS RATE
        // ==================================================
        // Selected payment type + selected date range.
        // ==================================================

        const [
            successRateRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_SUCCESS_RATE,

            [

                paymentType,

                selectedRange.startDate,

                selectedRange.endDate,

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // SUCCESS RATE CALCULATION
        // ==================================================

        const successRateData =
            successRateRows[0] || {};


        const totalTransactions =
            toNumber(
                successRateData
                    .total_transactions
            );


        const successfulTransactions =
            toNumber(
                successRateData
                    .successful_transactions
            );


        const successRate =
            totalTransactions > 0

                ? Number(
                    (
                        (
                            successfulTransactions /
                            totalTransactions
                        ) * 100
                    ).toFixed(2)
                )

                : 0;


        // ==================================================
        // FINAL RESPONSE
        // ==================================================

        return {

            paymentType,

            merchantId,

            filters: {

                startDate:
                    selectedRange.startDate,

                endDate:
                    selectedRange.endDate

            },


            // ==================================================
            // SUMMARY
            // ==================================================

            summary: {

                ...normalizeSummary(
                    summaryRows[0]
                ),

                ...normalizeRefund(
                    refundRows[0]
                ),

                ...normalizeRevenue({

                    todaysRevenue:
                        todaysRevenueRows[0],

                    monthlyRevenue:
                        monthlyRevenueRows[0]

                }),

                ...normalizeWallet({

                    availableBalance:
                        availableBalanceRows[0],

                    settledAmount:
                        settledAmountRows[0]

                })

            },


            // ==================================================
            // TOP MERCHANTS
            // ==================================================

            topMerchants:
                normalizeTopMerchants(
                    topMerchantRows
                ),


            // ==================================================
            // TRANSACTION VOLUME
            // ==================================================

            transactionVolume:
                transactionVolumeRows,


            // ==================================================
            // SUCCESS RATE
            // ==================================================

            successRate: {

                totalTransactions,

                successfulTransactions,

                percentage:
                    successRate

            }

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// GET DASHBOARD SUMMARY
// ==========================================================
// Separate endpoint:
// GET /admin/dashboard/summary
// ==========================================================

const getDashboardSummary = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        // ==================================================
        // 1. Transaction Summary
        // ==================================================

        const [
            summaryRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_DASHBOARD_SUMMARY

        );


        // ==================================================
        // 2. Refund Count
        // ==================================================

        const [
            refundRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_REFUND_COUNT,

            [

                startDate,

                endDate,

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // 3. Today's Revenue
        // ==================================================

        const today =
            new Date();


        const todayStart =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );


        const tomorrowStart =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + 1
            );


        const [
            todaysRevenueRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_TODAYS_REVENUE,

            [

                type,

                todayStart,

                tomorrowStart,

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // 4. Monthly Revenue
        // ==================================================

        const monthStart =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );


        const nextMonthStart =
            new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                1
            );


        const [
            monthlyRevenueRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_MONTHLY_REVENUE,

            [

                type,

                monthStart,

                nextMonthStart,

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // 5. Available Balance
        // ==================================================

        const [
            availableBalanceRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_AVAILABLE_BALANCE,

            [

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // 6. Settled Amount
        // ==================================================

        const [
            settledAmountRows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_SETTLED_AMOUNT,

            [

                merchantId,

                merchantId

            ]

        );


        // ==================================================
        // Raw Results
        // ==================================================

        const summary =
            summaryRows[0] || {};


        const refund =
            refundRows[0] || {};


        const todaysRevenue =
            todaysRevenueRows[0] || {};


        const monthlyRevenue =
            monthlyRevenueRows[0] || {};


        const availableBalance =
            availableBalanceRows[0] || {};


        const settledAmount =
            settledAmountRows[0] || {};


        // ==================================================
        // Summary Cards
        // ==================================================

        return {

            totalTransactions:
                toNumber(
                    summary.total_transactions
                ),

            successfulTransactions:
                toNumber(
                    summary.successful_transactions
                ),

            failedTransactions:
                toNumber(
                    summary.failed_transactions
                ),

            pendingTransactions:
                toNumber(
                    summary.pending_transactions
                ),

            createdTransactions:
                toNumber(
                    summary.created_transactions
                ),

            authorizedTransactions:
                toNumber(
                    summary.authorized_transactions
                ),

            cancelledTransactions:
                toNumber(
                    summary.cancelled_transactions
                ),

            refundedTransactions:
                toNumber(
                    summary.refunded_transactions
                ),

            partiallyRefundedTransactions:
                toNumber(
                    summary.partially_refunded_transactions
                ),

            chargebackTransactions:
                toNumber(
                    summary.chargeback_transactions
                ),

            refundCount:
                toNumber(
                    refund.refund_count
                ),

            todaysRevenue:
                toNumber(
                    todaysRevenue.todays_revenue
                ),

            monthlyRevenue:
                toNumber(
                    monthlyRevenue.monthly_revenue
                ),

            availableBalance:
                toNumber(
                    availableBalance.available_balance
                ),

            settledAmount:
                toNumber(
                    settledAmount.settled_amount
                )

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// GET RECENT TRANSACTIONS
// ==========================================================

const getRecentTransactions = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_RECENT_TRANSACTIONS,

            [

                type,

                startDate,

                endDate,

                merchantId,

                merchantId

            ]

        );


        return rows.map(
            (transaction) => ({

                transactionId:
                    transaction.transaction_id,

                orderId:
                    transaction.order_id,

                paymentId:
                    transaction.payment_id,

                merchantId:
                    transaction.merchant_id,

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

                currency:
                    transaction.currency,

                paymentMethod:
                    transaction.payment_method,

                transactionStatus:
                    transaction.transaction_status,

                gatewayResponse:
                    transaction.gateway_response,

                createdDate:
                    transaction.created_date,

                settlementDate:
                    transaction.settlement_date

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// GET TRANSACTION VOLUME
// ==========================================================

const getTransactionVolume = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_TRANSACTION_VOLUME,

            [

                type,

                startDate,

                endDate,

                merchantId,

                merchantId

            ]

        );


        return rows.map(
            (row) => ({

                date:
                    row.report_date
                        ? new Date(
                            row.report_date
                        )
                            .toISOString()
                            .slice(
                                0,
                                10
                            )
                        : null,

                totalTransactions:
                    Number(
                        row.total_transactions || 0
                    ),

                successfulTransactions:
                    Number(
                        row.successful_transactions || 0
                    ),

                failedTransactions:
                    Number(
                        row.failed_transactions || 0
                    ),

                pendingTransactions:
                    Number(
                        row.pending_transactions || 0
                    ),

                createdTransactions:
                    Number(
                        row.created_transactions || 0
                    ),

                authorizedTransactions:
                    Number(
                        row.authorized_transactions || 0
                    ),

                cancelledTransactions:
                    Number(
                        row.cancelled_transactions || 0
                    ),

                refundedTransactions:
                    Number(
                        row.refunded_transactions || 0
                    ),

                partiallyRefundedTransactions:
                    Number(
                        row.partially_refunded_transactions || 0
                    ),

                chargebackTransactions:
                    Number(
                        row.chargeback_transactions || 0
                    )

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// GET SUCCESS RATE
// ==========================================================

const getSuccessRate = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_SUCCESS_RATE,

            [

                type,

                startDate,

                endDate,

                merchantId,

                merchantId

            ]

        );


        const data =
            rows[0] || {};


        const totalTransactions =
            Number(
                data.total_transactions || 0
            );


        const successfulTransactions =
            Number(
                data.successful_transactions || 0
            );


        const percentage =
            totalTransactions > 0

                ? Number(
                    (
                        (
                            successfulTransactions /
                            totalTransactions
                        ) * 100
                    ).toFixed(2)
                )

                : 0;


        return {

            totalTransactions,

            successfulTransactions,

            percentage

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// GET PAYMENT METHOD ANALYTICS
// ==========================================================

const getPaymentMethodAnalytics = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_PAYMENT_METHOD_ANALYTICS,

            [

                type,

                startDate,

                endDate,

                merchantId,

                merchantId

            ]

        );


        return rows.map(
            (row) => ({

                paymentMethod:
                    row.payment_method,

                totalTransactions:
                    Number(
                        row.total_transactions || 0
                    ),

                successfulTransactions:
                    Number(
                        row.successful_transactions || 0
                    ),

                failedTransactions:
                    Number(
                        row.failed_transactions || 0
                    ),

                pendingTransactions:
                    Number(
                        row.pending_transactions || 0
                    ),

                createdTransactions:
                    Number(
                        row.created_transactions || 0
                    ),

                authorizedTransactions:
                    Number(
                        row.authorized_transactions || 0
                    ),

                cancelledTransactions:
                    Number(
                        row.cancelled_transactions || 0
                    ),

                refundedTransactions:
                    Number(
                        row.refunded_transactions || 0
                    ),

                partiallyRefundedTransactions:
                    Number(
                        row.partially_refunded_transactions || 0
                    ),

                chargebackTransactions:
                    Number(
                        row.chargeback_transactions || 0
                    ),

                successfulAmount:
                    Number(
                        row.successful_amount || 0
                    )

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// GET TRANSACTION STATUS ANALYTICS
// ==========================================================

const getTransactionStatusAnalytics = async ({
    type,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_TRANSACTION_STATUS_ANALYTICS,

            [

                type,

                startDate,

                endDate,

                merchantId,

                merchantId

            ]

        );


        return rows.map(
            (row) => ({

                status:
                    row.transaction_status,

                totalTransactions:
                    Number(
                        row.total_transactions || 0
                    ),

                totalAmount:
                    Number(
                        row.total_amount || 0
                    )

            })
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// GET TOP MERCHANTS
// ==========================================================

const getTopMerchants = async ({
    paymentType,
    merchantId = null,
    startDate,
    endDate,
    limit = 10
}) => {

    const connection =
        await db.getConnection();

    try {

        const safeLimit =
            Number(limit) > 0
                ? Math.min(
                    Number(limit),
                    100
                )
                : 10;


        const [
            rows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_TOP_MERCHANTS,

            [

                paymentType,

                startDate,

                endDate,

                merchantId,

                merchantId,

                safeLimit

            ]

        );


        return normalizeTopMerchants(
            rows
        );

    } finally {

        connection.release();

    }

};


// ==========================================================
// TRANSACTIONS SERVICE
// ==========================================================

const getTransactions = async ({
    paymentType = null,
    merchantId = null,
    status = null,
    paymentMethod = null,
    gatewayName = null,
    startDate = null,
    endDate = null,
    search = null,
    page = 1,
    limit = 20
}) => {

    const connection =
        await db.getConnection();

    try {

        const currentPage =
            Number(page) > 0
                ? Number(page)
                : 1;


        const currentLimit =
            Number(limit) > 0
                ? Math.min(
                    Number(limit),
                    100
                )
                : 20;


        const offset =
            (currentPage - 1) *
            currentLimit;


        const normalizedPaymentType =
            paymentType || null;

        const normalizedMerchantId =
            merchantId || null;

        const normalizedStatus =
            status || null;

        const normalizedPaymentMethod =
            paymentMethod || null;

        const normalizedGatewayName =
            gatewayName || null;

        const normalizedStartDate =
            startDate || null;

        const normalizedEndDate =
            endDate || null;

        const normalizedSearch =
            search && search.trim()
                ? search.trim()
                : null;


        const [
            rows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_TRANSACTIONS,

            [

                normalizedPaymentType,
                normalizedPaymentType,

                normalizedMerchantId,
                normalizedMerchantId,

                normalizedStatus,
                normalizedStatus,

                normalizedPaymentMethod,
                normalizedPaymentMethod,

                normalizedGatewayName,
                normalizedGatewayName,

                normalizedStartDate,
                normalizedStartDate,

                normalizedEndDate,
                normalizedEndDate,

                normalizedSearch,
                normalizedSearch,
                normalizedSearch,
                normalizedSearch,
                normalizedSearch,

                currentLimit,
                offset

            ]

        );


        const transactions =
            rows.map(
                (row) => ({

                    transactionId:
                        row.transaction_id,

                    transactionRef:
                        row.transaction_ref,

                    merchantId:
                        row.merchant_id,

                    businessName:
                        row.business_name,

                    orderId:
                        row.order_id,

                    gatewayOrderId:
                        row.gateway_order_id,

                    gatewayPaymentId:
                        row.gateway_payment_id,

                    gatewayReference:
                        row.gateway_reference,

                    customerName:
                        row.customer_name,

                    customerEmail:
                        row.customer_email,

                    customerPhone:
                        row.customer_phone,

                    amount:
                        Number(
                            row.amount
                        ),

                    currency:
                        row.currency,

                    paymentMethod:
                        row.payment_method,

                    gatewayName:
                        row.gateway_name,

                    paymentType:
                        row.payment_type,

                    status:
                        row.status,

                    merchantFee:
                        Number(
                            row.merchant_fee
                        ),

                    gatewayFee:
                        Number(
                            row.gateway_fee
                        ),

                    gatewayTax:
                        Number(
                            row.gateway_tax
                        ),

                    netAmount:
                        Number(
                            row.net_amount
                        ),

                    settlementStatus:
                        row.settlement_status,

                    settledAt:
                        row.settled_at,

                    failureCode:
                        row.failure_code,

                    failureMessage:
                        row.failure_message,

                    attemptCount:
                        Number(
                            row.attempt_count
                        ),

                    createdAt:
                        row.created_at,

                    completedAt:
                        row.completed_at,

                    updatedAt:
                        row.updated_at

                })
            );


        return {

            page:
                currentPage,

            limit:
                currentLimit,

            count:
                transactions.length,

            transactions

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// LATEST TRANSACTIONS
// ==========================================================

const getLatestTransactions = async ({
    paymentType = null,
    merchantId = null,
    limit = 10
}) => {

    const connection =
        await db.getConnection();

    try {

        const currentLimit =
            Number(limit) > 0
                ? Math.min(
                    Number(limit),
                    50
                )
                : 10;


        const normalizedPaymentType =
            paymentType || null;

        const normalizedMerchantId =
            merchantId || null;


        const [
            rows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_LATEST_TRANSACTIONS,

            [

                normalizedPaymentType,
                normalizedPaymentType,

                normalizedMerchantId,
                normalizedMerchantId,

                currentLimit

            ]

        );


        const transactions =
            rows.map(
                (row) => ({

                    transactionId:
                        row.transaction_id,

                    transactionRef:
                        row.transaction_ref,

                    merchantId:
                        row.merchant_id,

                    businessName:
                        row.business_name,

                    orderId:
                        row.order_id,

                    customerName:
                        row.customer_name,

                    customerEmail:
                        row.customer_email,

                    amount:
                        Number(
                            row.amount
                        ),

                    currency:
                        row.currency,

                    paymentMethod:
                        row.payment_method,

                    gatewayName:
                        row.gateway_name,

                    paymentType:
                        row.payment_type,

                    status:
                        row.status,

                    merchantFee:
                        Number(
                            row.merchant_fee
                        ),

                    gatewayFee:
                        Number(
                            row.gateway_fee
                        ),

                    gatewayTax:
                        Number(
                            row.gateway_tax
                        ),

                    netAmount:
                        Number(
                            row.net_amount
                        ),

                    settlementStatus:
                        row.settlement_status,

                    createdAt:
                        row.created_at,

                    completedAt:
                        row.completed_at

                })
            );


        return {

            count:
                transactions.length,

            transactions

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// TRANSACTION DASHBOARD
// ==========================================================

const getTransactionDashboard = async ({
    paymentType = null,
    merchantId = null,
    startDate,
    endDate
}) => {

    const connection =
        await db.getConnection();

    try {

        const normalizedPaymentType =
            paymentType || null;

        const normalizedMerchantId =
            merchantId || null;


        const [
            rows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_TRANSACTION_DASHBOARD,

            [

                normalizedPaymentType,
                normalizedPaymentType,

                normalizedMerchantId,
                normalizedMerchantId,

                startDate,
                endDate

            ]

        );


        const data =
            rows[0] || {};


        return {

            totalTransactions:
                toNumber(
                    data.total_transactions
                ),

            successfulTransactions:
                toNumber(
                    data.successful_transactions
                ),

            failedTransactions:
                toNumber(
                    data.failed_transactions
                ),

            pendingTransactions:
                toNumber(
                    data.pending_transactions
                ),

            createdTransactions:
                toNumber(
                    data.created_transactions
                ),

            authorizedTransactions:
                toNumber(
                    data.authorized_transactions
                ),

            cancelledTransactions:
                toNumber(
                    data.cancelled_transactions
                ),

            refundedTransactions:
                toNumber(
                    data.refunded_transactions
                ),

            partiallyRefundedTransactions:
                toNumber(
                    data.partially_refunded_transactions
                ),

            chargebackTransactions:
                toNumber(
                    data.chargeback_transactions
                ),

            totalAmount:
                toNumber(
                    data.total_amount
                ),

            successfulAmount:
                toNumber(
                    data.successful_amount
                ),

            failedAmount:
                toNumber(
                    data.failed_amount
                ),

            refundedAmount:
                toNumber(
                    data.refunded_amount
                ),

            partiallyRefundedAmount:
                toNumber(
                    data.partially_refunded_amount
                ),

            chargebackAmount:
                toNumber(
                    data.chargeback_amount
                )

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// GET TRANSACTION BY ID
// ==========================================================

const getTransactionById = async (
    transactionId
) => {

    const connection =
        await db.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            DASHBOARD_QUERIES
                .GET_TRANSACTION_BY_ID,

            [

                transactionId

            ]

        );


        if (!rows.length) {

            return null;

        }


        const row =
            rows[0];


        return {

            transactionId:
                row.transaction_id,

            transactionRef:
                row.transaction_ref,

            merchantId:
                row.merchant_id,

            businessName:
                row.business_name,

            orderId:
                row.order_id,

            gatewayOrderId:
                row.gateway_order_id,

            gatewayPaymentId:
                row.gateway_payment_id,

            gatewayReference:
                row.gateway_reference,

            gatewayResponse: (() => {

                if (!row.gateway_response) {
                    return null;
                }


                let response =
                    row.gateway_response;


                if (
                    typeof response === "string"
                ) {

                    try {

                        response =
                            JSON.parse(
                                response
                            );

                    } catch (error) {

                        return row.gateway_response;

                    }

                }


                if (
                    response &&
                    response.amount !== undefined &&
                    response.amount !== null
                ) {

                    response.amount =
                        Number(
                            response.amount
                        ) / 100;

                }


                return response;

            })(),

            customerName:
                row.customer_name,

            customerEmail:
                row.customer_email,

            customerPhone:
                row.customer_phone,

            amount:
                Number(
                    row.amount
                ),

            currency:
                row.currency,

            paymentMethod:
                row.payment_method,

            gatewayName:
                row.gateway_name,

            paymentType:
                row.payment_type,

            status:
                row.status,

            completionSource:
                row.completion_source,

            merchantFee:
                Number(
                    row.merchant_fee
                ),

            gatewayFee:
                Number(
                    row.gateway_fee
                ),

            gatewayTax:
                Number(
                    row.gateway_tax
                ),

            netAmount:
                Number(
                    row.net_amount
                ),

            settlementStatus:
                row.settlement_status,

            settledAt:
                row.settled_at,

            failureCode:
                row.failure_code,

            failureMessage:
                row.failure_message,

            attemptCount:
                Number(
                    row.attempt_count
                ),

            expiresAt:
                row.expires_at,

            idempotencyKey:
                row.idempotency_key,

            clientIp:
                row.client_ip,

            userAgent:
                row.user_agent,

            remarks:
                row.remarks,

            createdAt:
                row.created_at,

            completedAt:
                row.completed_at,

            updatedAt:
                row.updated_at

        };

    } finally {

        connection.release();

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    getAdminDashboard,

    getDashboardSummary,

    buildDateRange,

    getRecentTransactions,

    getTransactionVolume,

    getSuccessRate,

    getPaymentMethodAnalytics,

    getTransactionStatusAnalytics,

    getTopMerchants,

    getTransactions,

    getLatestTransactions,

    getTransactionDashboard,

    getTransactionById

};
