const db = require(
    "../../../config/pool"
);

const REPORTS_QUERIES = require(
    "../../../queries/merchant/report/report.query"
);


// ==========================================================
// Normalize Summary
// ==========================================================

const normalizeSummary = (summary) => {

    const data = summary || {};

    return {

        // ==================================================
        // TOTAL
        // ==================================================

        totalTransactions:
            Number(
                data.total_transactions || 0
            ),

        totalAmount:
            Number(
                data.total_amount || 0
            ),


        // ==================================================
        // SUCCESS
        // ==================================================

        successfulTransactions:
            Number(
                data.successful_transactions || 0
            ),

        successfulAmount:
            Number(
                data.successful_amount || 0
            ),


        // ==================================================
        // FAILED
        // ==================================================

        failedTransactions:
            Number(
                data.failed_transactions || 0
            ),

        failedAmount:
            Number(
                data.failed_amount || 0
            ),


        // ==================================================
        // PENDING
        // ==================================================

        pendingTransactions:
            Number(
                data.pending_transactions || 0
            ),

        pendingAmount:
            Number(
                data.pending_amount || 0
            ),


        // ==================================================
        // CREATED
        // ==================================================

        createdTransactions:
            Number(
                data.created_transactions || 0
            ),

        createdAmount:
            Number(
                data.created_amount || 0
            ),


        // ==================================================
        // AUTHORIZED
        // IMPORTANT
        // ==================================================

        authorizedTransactions:
            Number(
                data.authorized_transactions || 0
            ),

        authorizedAmount:
            Number(
                data.authorized_amount || 0
            ),


        // ==================================================
        // CANCELLED
        // ==================================================

        cancelledTransactions:
            Number(
                data.cancelled_transactions || 0
            ),

        cancelledAmount:
            Number(
                data.cancelled_amount || 0
            ),


        // ==================================================
        // REFUNDED
        // ==================================================

        refundedTransactions:
            Number(
                data.refunded_transactions || 0
            ),

        refundedAmount:
            Number(
                data.refunded_amount || 0
            ),


        // ==================================================
        // PARTIALLY REFUNDED
        // ==================================================

        partiallyRefundedTransactions:
            Number(
                data.partially_refunded_transactions || 0
            ),

        partiallyRefundedAmount:
            Number(
                data.partially_refunded_amount || 0
            ),


        // ==================================================
        // CHARGEBACK
        // ==================================================

        chargebackTransactions:
            Number(
                data.chargeback_transactions || 0
            ),

        chargebackAmount:
            Number(
                data.chargeback_amount || 0
            )

    };

};


// ==========================================================
// Daily Date Range
// ==========================================================

const getDailyRange = (
    date
) => {

    const [
        year,
        month,
        day
    ] = date
        .split("-")
        .map(Number);


    const nextDate = new Date(
        year,
        month - 1,
        day + 1
    );


    const nextYear =
        nextDate.getFullYear();


    const nextMonth =
        String(
            nextDate.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const nextDay =
        String(
            nextDate.getDate()
        ).padStart(
            2,
            "0"
        );


    return {

        startDate:
            `${date} 00:00:00`,

        endDate:
            `${nextYear}-${nextMonth}-${nextDay} 00:00:00`

    };

};


// ==========================================================
// Monthly Date Range
// ==========================================================

const getMonthlyRange = (
    year,
    month
) => {

    const normalizedYear =
        Number(year);


    const normalizedMonth =
        Number(month);


    const startDate =
        `${normalizedYear}-${String(
            normalizedMonth
        ).padStart(
            2,
            "0"
        )}-01 00:00:00`;


    let nextYear =
        normalizedYear;


    let nextMonth =
        normalizedMonth + 1;


    if (
        nextMonth > 12
    ) {

        nextMonth = 1;

        nextYear++;

    }


    const endDate =
        `${nextYear}-${String(
            nextMonth
        ).padStart(
            2,
            "0"
        )}-01 00:00:00`;


    return {

        startDate,

        endDate

    };

};


// ==========================================================
// Get Daily Report
// ==========================================================

const getDailyReport = async (
    merchantId,
    date
) => {

    const {
        startDate,
        endDate
    } =
        getDailyRange(
            date
        );


    const connection =
        await db.getConnection();


    try {

        // ==================================================
        // Daily Summary
        // ==================================================

        const [
            summaryRows
        ] =
            await connection.query(

                REPORTS_QUERIES
                    .GET_DAILY_SUMMARY,

                [
                    merchantId,
                    startDate,
                    endDate
                ]

            );


        // ==================================================
        // Daily Transactions
        // ==================================================

        const [
            transactions
        ] =
            await connection.query(

                REPORTS_QUERIES
                    .GET_DAILY_TRANSACTIONS,

                [
                    merchantId,
                    startDate,
                    endDate
                ]

            );


        // ==================================================
        // Return Report
        // ==================================================

        return {

            reportType:
                "DAILY",

            date,

            summary:
                normalizeSummary(
                    summaryRows[0]
                ),

            transactions

        };

    }

    finally {

        connection.release();

    }

};


// ==========================================================
// Get Monthly Report
// ==========================================================

const getMonthlyReport = async (
    merchantId,
    month,
    year
) => {

    const {
        startDate,
        endDate
    } =
        getMonthlyRange(
            year,
            month
        );


    const connection =
        await db.getConnection();


    try {

        // ==================================================
        // Monthly Summary
        // ==================================================

        const [
            summaryRows
        ] =
            await connection.query(

                REPORTS_QUERIES
                    .GET_MONTHLY_SUMMARY,

                [
                    merchantId,
                    startDate,
                    endDate
                ]

            );


        // ==================================================
        // Daily Breakdown
        // ==================================================

        const [
            dailyBreakdown
        ] =
            await connection.query(

                REPORTS_QUERIES
                    .GET_MONTHLY_DAILY_BREAKDOWN,

                [
                    merchantId,
                    startDate,
                    endDate
                ]

            );


        // ==================================================
        // Monthly Transactions
        // ==================================================

        const [
            transactions
        ] =
            await connection.query(

                REPORTS_QUERIES
                    .GET_MONTHLY_TRANSACTIONS,

                [
                    merchantId,
                    startDate,
                    endDate
                ]

            );


        // ==================================================
        // Return Report
        // ==================================================

        return {

            reportType:
                "MONTHLY",

            month:
                Number(month),

            year:
                Number(year),

            summary:
                normalizeSummary(
                    summaryRows[0]
                ),

            dailyBreakdown,

            transactions

        };

    }

    finally {

        connection.release();

    }

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    getDailyReport,

    getMonthlyReport

};