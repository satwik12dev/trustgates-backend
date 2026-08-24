const pool = require("../../../config/pool");

const getDailyTimeWindow = (date) => {
    if (!date) {
        throw new Error("Report date is required.");
    }

    let dateString;

    if (date instanceof Date) {
        if (Number.isNaN(date.getTime())) {
            throw new Error("Invalid report date.");
        }

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        dateString = `${year}-${month}-${day}`;
    } else {
        dateString = String(date).slice(0, 10);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new Error(
            "Invalid date. Expected YYYY-MM-DD."
        );
    }

    const [year, month, day] =
        dateString.split("-").map(Number);

    const nextDate = new Date(
        year,
        month - 1,
        day + 1
    );

    const nextYear = nextDate.getFullYear();

    const nextMonth = String(
        nextDate.getMonth() + 1
    ).padStart(2, "0");

    const nextDay = String(
        nextDate.getDate()
    ).padStart(2, "0");

    return {
        startDateTime:
            `${dateString} 00:00:00`,

        endDateTime:
            `${nextYear}-${nextMonth}-${nextDay} 00:00:00`
    };
};


const applyTransactionFilters = (
    query,
    params,
    {
        merchantId = null,
        paymentMethod = null,
        paymentType = null,
        status = null
    } = {}
) => {

    let updatedQuery = query;

    if (
        merchantId !== null &&
        merchantId !== undefined
    ) {
        updatedQuery += `
            AND t.merchant_id = ?
        `;

        params.push(merchantId);
    }

    if (paymentMethod) {
        updatedQuery += `
            AND t.payment_method = ?
        `;

        params.push(paymentMethod);
    }

    if (paymentType) {
        updatedQuery += `
            AND t.payment_type = ?
        `;

        params.push(paymentType);
    }

    if (status) {
        updatedQuery += `
            AND t.status = ?
        `;

        params.push(status);
    }

    return {
        query: updatedQuery,
        params
    };
};


const getDailySummary = async ({
    date,
    merchantId = null,
    paymentType = null,
    paymentMethod = null,
    status = null
}) => {

    const {
        startDateTime,
        endDateTime
    } = getDailyTimeWindow(date);

    let query = `
        SELECT

            COUNT(*) AS totalTransactions,

            SUM(
                CASE
                    WHEN t.status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successfulTransactions,

            SUM(
                CASE
                    WHEN t.status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS createdTransactions,

            SUM(
                CASE
                    WHEN t.status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failedTransactions,

            SUM(
                CASE
                    WHEN t.status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pendingTransactions,

            SUM(
                CASE
                    WHEN t.status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refundedTransactions,

            SUM(
                CASE
                    WHEN t.status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargebackTransactions,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN t.status = 'SUCCESS'
                            THEN t.amount
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS totalRevenue,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN t.status = 'SUCCESS'
                            THEN t.gateway_fee
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS totalGatewayFee,

            ROUND(
                COALESCE(AVG(t.amount), 0),
                2
            ) AS averageTransactionAmount

        FROM transactions t

        WHERE t.created_at >= ?
        AND t.created_at < ?
    `;

    const params = [
        startDateTime,
        endDateTime
    ];

    const filtered =
        applyTransactionFilters(
            query,
            params,
            {
                merchantId,
                paymentMethod,
                paymentType,
                status
            }
        );

    const [rows] = await pool.query(
        filtered.query,
        filtered.params
    );

    const row = rows[0] || {};

    const totalTransactions =
        Number(row.totalTransactions || 0);

    const successfulTransactions =
        Number(row.successfulTransactions || 0);

    return {
        totalTransactions,

        successfulTransactions,

        createdTransactions:
            Number(
                row.createdTransactions || 0
            ),

        failedTransactions:
            Number(
                row.failedTransactions || 0
            ),

        pendingTransactions:
            Number(
                row.pendingTransactions || 0
            ),

        refundedTransactions:
            Number(
                row.refundedTransactions || 0
            ),

        chargebackTransactions:
            Number(
                row.chargebackTransactions || 0
            ),

        totalRevenue:
            Number(
                row.totalRevenue || 0
            ),

        totalGatewayFee:
            Number(
                row.totalGatewayFee || 0
            ),

        averageTransactionAmount:
            Number(
                row.averageTransactionAmount || 0
            ),

        successRate:
            totalTransactions > 0
                ? Number(
                    (
                        successfulTransactions /
                        totalTransactions *
                        100
                    ).toFixed(2)
                )
                : 0
    };
};


const getHourlyTransactions = async ({
    date,
    merchantId = null,
    paymentType = null,
    paymentMethod = null,
    status = null
}) => {

    const {
        startDateTime,
        endDateTime
    } = getDailyTimeWindow(date);

    let query = `
        SELECT

            HOUR(t.created_at) AS hour,

            COUNT(*) AS totalTransactions,

            SUM(
                CASE
                    WHEN t.status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successfulTransactions,

            SUM(
                CASE
                    WHEN t.status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS createdTransactions,

            SUM(
                CASE
                    WHEN t.status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failedTransactions,

            SUM(
                CASE
                    WHEN t.status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pendingTransactions,

            SUM(
                CASE
                    WHEN t.status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refundedTransactions,

            SUM(
                CASE
                    WHEN t.status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargebackTransactions,

            ROUND(
                COALESCE(
                    SUM(t.amount),
                    0
                ),
                2
            ) AS totalAmount,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN t.status = 'SUCCESS'
                            THEN t.amount
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS successfulAmount

        FROM transactions t

        WHERE t.created_at >= ?
        AND t.created_at < ?
    `;

    const params = [
        startDateTime,
        endDateTime
    ];

    const filtered =
        applyTransactionFilters(
            query,
            params,
            {
                merchantId,
                paymentMethod,
                paymentType,
                status
            }
        );

    query = filtered.query;

    query += `
        GROUP BY HOUR(t.created_at)
        ORDER BY hour ASC
    `;

    const [rows] = await pool.query(
        query,
        filtered.params
    );

    const hourlyMap = new Map();

    rows.forEach(row => {

        hourlyMap.set(
            Number(row.hour),
            {
                totalTransactions:
                    Number(
                        row.totalTransactions || 0
                    ),

                successfulTransactions:
                    Number(
                        row.successfulTransactions || 0
                    ),

                createdTransactions:
                    Number(
                        row.createdTransactions || 0
                    ),

                failedTransactions:
                    Number(
                        row.failedTransactions || 0
                    ),

                pendingTransactions:
                    Number(
                        row.pendingTransactions || 0
                    ),

                refundedTransactions:
                    Number(
                        row.refundedTransactions || 0
                    ),

                chargebackTransactions:
                    Number(
                        row.chargebackTransactions || 0
                    ),

                totalAmount:
                    Number(
                        row.totalAmount || 0
                    ),

                successfulAmount:
                    Number(
                        row.successfulAmount || 0
                    )
            }
        );
    });

    return Array.from(
        { length: 24 },
        (_, hour) => {

            const data =
                hourlyMap.get(hour) || {
                    totalTransactions: 0,
                    successfulTransactions: 0,
                    createdTransactions: 0,
                    failedTransactions: 0,
                    pendingTransactions: 0,
                    refundedTransactions: 0,
                    chargebackTransactions: 0,
                    totalAmount: 0,
                    successfulAmount: 0
                };

            return {
                hour: `${hour}:00`,
                ...data
            };
        }
    );
};


const getDailyTransactions = async ({
    date,
    merchantId = null,
    paymentMethod = null,
    paymentType = null,
    status = null,
    search = null,
    page = 1,
    limit = 20
}) => {

    const {
        startDateTime,
        endDateTime
    } = getDailyTimeWindow(date);

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

    const offset =
        (currentPage - 1) *
        currentLimit;

    let query = `
        SELECT

            t.transaction_id,
            t.transaction_ref,
            t.merchant_id,

            t.order_id,
            t.gateway_order_id,
            t.gateway_payment_id,
            t.gateway_reference,

            m.merchant_name,
            m.business_name,

            t.customer_name,
            t.customer_email,
            t.customer_phone,

            t.amount,
            t.merchant_fee,
            t.gateway_fee,
            t.gateway_tax,
            t.net_amount,

            t.currency,
            t.payment_method,
            t.payment_type,
            t.status,

            t.completion_source,
            t.settlement_status,

            t.created_at,
            t.completed_at,
            t.updated_at

        FROM transactions t

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE t.created_at >= ?
        AND t.created_at < ?
    `;

    const params = [
        startDateTime,
        endDateTime
    ];

    const filtered =
        applyTransactionFilters(
            query,
            params,
            {
                merchantId,
                paymentMethod,
                paymentType,
                status
            }
        );

    query = filtered.query;

    if (
        search &&
        String(search).trim()
    ) {

        const searchValue =
            `%${String(search).trim()}%`;

        query += `
            AND (
                t.transaction_ref LIKE ?
                OR t.order_id LIKE ?
                OR t.gateway_order_id LIKE ?
                OR t.gateway_payment_id LIKE ?
                OR t.gateway_reference LIKE ?
                OR t.customer_name LIKE ?
                OR t.customer_email LIKE ?
                OR t.customer_phone LIKE ?
                OR m.merchant_name LIKE ?
                OR m.business_name LIKE ?
            )
        `;

        filtered.params.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue
        );
    }

    query += `
        ORDER BY
            t.created_at DESC,
            t.transaction_id DESC

        LIMIT ?
        OFFSET ?
    `;

    filtered.params.push(
        currentLimit,
        offset
    );

    const [rows] = await pool.query(
        query,
        filtered.params
    );

    return rows;
};


const getDailyTransactionsCount = async ({
    date,
    merchantId = null,
    paymentMethod = null,
    paymentType = null,
    status = null,
    search = null
}) => {

    const {
        startDateTime,
        endDateTime
    } = getDailyTimeWindow(date);

    let query = `
        SELECT
            COUNT(*) AS totalRecords

        FROM transactions t

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE t.created_at >= ?
        AND t.created_at < ?
    `;

    const params = [
        startDateTime,
        endDateTime
    ];

    const filtered =
        applyTransactionFilters(
            query,
            params,
            {
                merchantId,
                paymentMethod,
                paymentType,
                status
            }
        );

    query = filtered.query;

    if (
        search &&
        String(search).trim()
    ) {

        const searchValue =
            `%${String(search).trim()}%`;

        query += `
            AND (
                t.transaction_ref LIKE ?
                OR t.order_id LIKE ?
                OR t.gateway_order_id LIKE ?
                OR t.gateway_payment_id LIKE ?
                OR t.gateway_reference LIKE ?
                OR t.customer_name LIKE ?
                OR t.customer_email LIKE ?
                OR t.customer_phone LIKE ?
                OR m.merchant_name LIKE ?
                OR m.business_name LIKE ?
            )
        `;

        filtered.params.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue
        );
    }

    const [rows] = await pool.query(
        query,
        filtered.params
    );

    return Number(
        rows[0]?.totalRecords || 0
    );
};


const getPaymentMethodDistribution = async ({
    date,
    merchantId = null,
    paymentType = null,
    status = null
}) => {

    const {
        startDateTime,
        endDateTime
    } = getDailyTimeWindow(date);

    let query = `
        SELECT

            t.payment_method,

            COUNT(*) AS totalTransactions,

            SUM(
                CASE
                    WHEN t.status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successfulTransactions,

            SUM(
                CASE
                    WHEN t.status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS createdTransactions,

            SUM(
                CASE
                    WHEN t.status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failedTransactions,

            SUM(
                CASE
                    WHEN t.status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pendingTransactions,

            SUM(
                CASE
                    WHEN t.status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refundedTransactions,

            SUM(
                CASE
                    WHEN t.status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargebackTransactions,

            ROUND(
                COALESCE(
                    SUM(t.amount),
                    0
                ),
                2
            ) AS totalAmount,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN t.status = 'SUCCESS'
                            THEN t.amount
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS successfulAmount

        FROM transactions t

        WHERE t.created_at >= ?
        AND t.created_at < ?
    `;

    const params = [
        startDateTime,
        endDateTime
    ];

    const filtered =
        applyTransactionFilters(
            query,
            params,
            {
                merchantId,
                paymentType,
                status
            }
        );

    query = filtered.query;

    query += `
        GROUP BY t.payment_method
        ORDER BY totalTransactions DESC
    `;

    const [rows] = await pool.query(
        query,
        filtered.params
    );

    return rows;
};


const getPaymentTypeDistribution = async ({
    date,
    merchantId = null,
    paymentMethod = null,
    status = null
}) => {

    const {
        startDateTime,
        endDateTime
    } = getDailyTimeWindow(date);

    let query = `
        SELECT

            t.payment_type,

            COUNT(*) AS totalTransactions,

            SUM(
                CASE
                    WHEN t.status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successfulTransactions,

            SUM(
                CASE
                    WHEN t.status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS createdTransactions,

            SUM(
                CASE
                    WHEN t.status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failedTransactions,

            SUM(
                CASE
                    WHEN t.status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pendingTransactions,

            SUM(
                CASE
                    WHEN t.status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refundedTransactions,

            SUM(
                CASE
                    WHEN t.status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargebackTransactions,

            ROUND(
                COALESCE(
                    SUM(t.amount),
                    0
                ),
                2
            ) AS totalAmount,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN t.status = 'SUCCESS'
                            THEN t.amount
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS successfulAmount

        FROM transactions t

        WHERE t.created_at >= ?
        AND t.created_at < ?
    `;

    const params = [
        startDateTime,
        endDateTime
    ];

    const filtered =
        applyTransactionFilters(
            query,
            params,
            {
                merchantId,
                paymentMethod,
                status
            }
        );

    query = filtered.query;

    query += `
        GROUP BY t.payment_type
        ORDER BY totalTransactions DESC
    `;

    const [rows] = await pool.query(
        query,
        filtered.params
    );

    return rows;
};


const getExportTransactions = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    if (!startDate || !endDate) {
        throw new Error(
            "Start date and end date are required."
        );
    }

    const startDateString =
        startDate instanceof Date
            ? `${startDate.getFullYear()}-${String(
                startDate.getMonth() + 1
            ).padStart(2, "0")}-${String(
                startDate.getDate()
            ).padStart(2, "0")}`
            : String(startDate).slice(0, 10);

    const endDateString =
        endDate instanceof Date
            ? `${endDate.getFullYear()}-${String(
                endDate.getMonth() + 1
            ).padStart(2, "0")}-${String(
                endDate.getDate()
            ).padStart(2, "0")}`
            : String(endDate).slice(0, 10);

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(startDateString) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(endDateString)
    ) {
        throw new Error(
            "Invalid date range. Expected YYYY-MM-DD."
        );
    }

    /*
    ============================================================
    DATE RANGE
    ============================================================

    Example:

    startDate = 2026-08-01
    endDate   = 2026-08-31

    Query:

    >= 2026-08-01 00:00:00
    <
      2026-09-01 00:00:00

    This guarantees that:

    31 July  -> excluded
    1 August -> included
    31 August -> included
    1 September -> excluded
    ============================================================
    */

    const [year, month, day] =
        endDateString.split("-").map(Number);

    const nextDate = new Date(
        year,
        month - 1,
        day + 1
    );

    const nextDateString =
        `${nextDate.getFullYear()}-${String(
            nextDate.getMonth() + 1
        ).padStart(2, "0")}-${String(
            nextDate.getDate()
        ).padStart(2, "0")}`;

    const startDateTime =
        `${startDateString} 00:00:00`;

    const endDateTime =
        `${nextDateString} 00:00:00`;

    let query = `

        SELECT

            t.transaction_id,
            t.transaction_ref,

            t.merchant_id,

            m.merchant_name,
            m.business_name,

            t.order_id,
            t.gateway_order_id,
            t.gateway_payment_id,
            t.gateway_reference,

            t.customer_name,
            t.customer_email,
            t.customer_phone,

            t.amount,
            t.merchant_fee,
            t.gateway_fee,
            t.gateway_tax,
            t.net_amount,

            t.currency,
            t.payment_method,
            t.payment_type,
            t.status,

            t.completion_source,
            t.settlement_status,

            t.created_at,
            t.completed_at,
            t.updated_at

        FROM transactions t

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE t.created_at >= ?
        AND t.created_at < ?

    `;

    const params = [
        startDateTime,
        endDateTime
    ];

    if (
        merchantId !== null &&
        merchantId !== undefined &&
        merchantId !== ""
    ) {

        query += `
            AND t.merchant_id = ?
        `;

        params.push(
            merchantId
        );
    }

    query += `

        ORDER BY
            t.created_at DESC,
            t.transaction_id DESC

    `;

    const [rows] =
        await pool.query(
            query,
            params
        );


    return rows;
};

const getMonthlyTimeWindow = (month, year) => {

    const numericMonth = Number(month);
    const numericYear = Number(year);

    if (
        !Number.isInteger(numericMonth) ||
        numericMonth < 1 ||
        numericMonth > 12
    ) {
        throw new Error(
            "Invalid month. Expected 1-12."
        );
    }

    if (
        !Number.isInteger(numericYear) ||
        numericYear < 2000 ||
        numericYear > 9999
    ) {
        throw new Error(
            "Invalid year."
        );
    }

    const pad = (value) =>
        String(value).padStart(2, "0");

    const startDateTime =
        `${numericYear}-${pad(numericMonth)}-01 00:00:00`;

    let nextMonth =
        numericMonth + 1;

    let nextYear =
        numericYear;

    if (nextMonth === 13) {
        nextMonth = 1;
        nextYear++;
    }

    const endDateTime =
        `${nextYear}-${pad(nextMonth)}-01 00:00:00`;

    return {
        startDateTime,
        endDateTime
    };
};


const getMonthlySummary = async ({
    month,
    year,
    merchantId = null,
    paymentType = null,
    paymentMethod = null
}) => {

    let query = `
        SELECT

            COUNT(*) AS totalTransactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successfulTransactions,

            SUM(
                CASE
                    WHEN status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS createdTransactions,

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failedTransactions,

            SUM(
                CASE
                    WHEN status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pendingTransactions,

            SUM(
                CASE
                    WHEN status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refundedTransactions,

            SUM(
                CASE
                    WHEN status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargebackTransactions,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN status = 'SUCCESS'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS totalRevenue,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN status = 'SUCCESS'
                            THEN gateway_fee
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS totalGatewayFee,

            ROUND(
                COALESCE(AVG(amount), 0),
                2
            ) AS averageTransactionAmount

        FROM transactions

        WHERE created_at >= ?
        AND created_at < ?
    `;

    const {
        startDateTime,
        endDateTime
    } = getMonthlyTimeWindow(
        month,
        year
    );

    const params = [
        startDateTime,
        endDateTime
    ];

    if (
        merchantId !== null &&
        merchantId !== undefined
    ) {
        query += `
            AND merchant_id = ?
        `;

        params.push(merchantId);
    }

    if (paymentType) {
        query += `
            AND payment_type = ?
        `;

        params.push(paymentType);
    }

    if (paymentMethod) {
        query += `
            AND payment_method = ?
        `;

        params.push(paymentMethod);
    }

    const [rows] =
        await pool.query(
            query,
            params
        );

    return rows[0] || {};
};


const getMonthlyRevenueTrend = async ({
    month,
    year,
    merchantId = null,
    paymentType = null,
    paymentMethod = null,
    status = null
}) => {

    const {
        startDateTime,
        endDateTime
    } = getMonthlyTimeWindow(
        month,
        year
    );

    let query = `
        SELECT

            DAY(
                CONVERT_TZ(
                    created_at,
                    '+00:00',
                    '+05:30'
                )
            ) AS day,

            COUNT(*) AS totalTransactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successfulTransactions,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN status = 'SUCCESS'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS revenue,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN status = 'SUCCESS'
                            THEN gateway_fee
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS gatewayFee

        FROM transactions

        WHERE created_at >= ?
        AND created_at < ?
    `;

    const params = [
        startDateTime,
        endDateTime
    ];

    if (
        merchantId !== null &&
        merchantId !== undefined
    ) {
        query += `
            AND merchant_id = ?
        `;

        params.push(merchantId);
    }

    if (paymentType) {
        query += `
            AND payment_type = ?
        `;

        params.push(paymentType);
    }

    if (paymentMethod) {
        query += `
            AND payment_method = ?
        `;

        params.push(paymentMethod);
    }

    if (status) {
        query += `
            AND status = ?
        `;

        params.push(status);
    }

    query += `
        GROUP BY
            DAY(
                CONVERT_TZ(
                    created_at,
                    '+00:00',
                    '+05:30'
                )
            )

        ORDER BY day ASC
    `;

    const [rows] =
        await pool.query(
            query,
            params
        );

    return rows;
};


const getMonthlyTransactionTrend = async ({
    month,
    year,
    merchantId = null,
    paymentType = null,
    paymentMethod = null,
    status = null
}) => {

    const {
        startDateTime,
        endDateTime
    } = getMonthlyTimeWindow(
        month,
        year
    );

    let query = `
        SELECT

            DAY(
                CONVERT_TZ(
                    created_at,
                    '+00:00',
                    '+05:30'
                )
            ) AS day,

            COUNT(*) AS totalTransactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful,

            SUM(
                CASE
                    WHEN status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS created,

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed,

            SUM(
                CASE
                    WHEN status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pending,

            SUM(
                CASE
                    WHEN status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded,

            SUM(
                CASE
                    WHEN status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargeback

        FROM transactions

        WHERE created_at >= ?
        AND created_at < ?
    `;

    const params = [
        startDateTime,
        endDateTime
    ];

    if (
        merchantId !== null &&
        merchantId !== undefined
    ) {
        query += `
            AND merchant_id = ?
        `;

        params.push(merchantId);
    }

    if (paymentType) {
        query += `
            AND payment_type = ?
        `;

        params.push(paymentType);
    }

    if (paymentMethod) {
        query += `
            AND payment_method = ?
        `;

        params.push(paymentMethod);
    }

    if (status) {
        query += `
            AND status = ?
        `;

        params.push(status);
    }

    query += `
        GROUP BY
            DAY(
                CONVERT_TZ(
                    created_at,
                    '+00:00',
                    '+05:30'
                )
            )

        ORDER BY day ASC
    `;

    const [rows] =
        await pool.query(
            query,
            params
        );

    return rows;
};


const getMonthlyRefundTrend = async ({
    month,
    year,
    merchantId = null
}) => {

    const {
        startDateTime,
        endDateTime
    } = getMonthlyTimeWindow(
        month,
        year
    );

    let query = `
        SELECT

            DAY(
                CONVERT_TZ(
                    tr.created_at,
                    '+00:00',
                    '+05:30'
                )
            ) AS day,

            COUNT(*) AS totalRefunds,

            ROUND(
                COALESCE(
                    SUM(tr.amount),
                    0
                ),
                2
            ) AS refundAmount,

            ROUND(
                COALESCE(
                    SUM(tr.fee_amount),
                    0
                ),
                2
            ) AS refundFee,

            ROUND(
                COALESCE(
                    SUM(tr.total_debit_amount),
                    0
                ),
                2
            ) AS totalDebitAmount

        FROM transaction_refunds tr

        WHERE tr.created_at >= ?
        AND tr.created_at < ?

        AND tr.refund_status = 'PROCESSED'
    `;

    const params = [
        startDateTime,
        endDateTime
    ];

    if (
        merchantId !== null &&
        merchantId !== undefined
    ) {
        query += `
            AND tr.merchant_id = ?
        `;

        params.push(merchantId);
    }

    query += `
        GROUP BY
            DAY(
                CONVERT_TZ(
                    tr.created_at,
                    '+00:00',
                    '+05:30'
                )
            )

        ORDER BY day ASC
    `;

    const [rows] =
        await pool.query(
            query,
            params
        );

    return rows;
};


const getTopMerchants = async ({
    month,
    year,
    limit = 10,
    paymentType = null,
    paymentMethod = null
}) => {

    const {
        startDateTime,
        endDateTime
    } = getMonthlyTimeWindow(
        month,
        year
    );

    let query = `
        SELECT

            m.merchant_id,
            m.merchant_name,
            m.business_name,
            m.merchant_code,

            COUNT(
                t.transaction_id
            ) AS totalTransactions,

            SUM(
                CASE
                    WHEN t.status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successfulTransactions,

            SUM(
                CASE
                    WHEN t.status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS createdTransactions,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN t.status = 'SUCCESS'
                            THEN t.amount
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS revenue,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN t.status = 'SUCCESS'
                            THEN t.gateway_fee
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS gatewayFee

        FROM merchants m

        INNER JOIN transactions t
            ON m.merchant_id = t.merchant_id

        WHERE t.created_at >= ?
        AND t.created_at < ?
    `;

    const params = [
        startDateTime,
        endDateTime
    ];

    if (paymentType) {
        query += `
            AND t.payment_type = ?
        `;

        params.push(paymentType);
    }

    if (paymentMethod) {
        query += `
            AND t.payment_method = ?
        `;

        params.push(paymentMethod);
    }

    query += `
        GROUP BY

            m.merchant_id,
            m.merchant_name,
            m.business_name,
            m.merchant_code

        ORDER BY revenue DESC

        LIMIT ?
    `;

    params.push(
        Math.min(
            Math.max(
                Number(limit) || 10,
                1
            ),
            100
        )
    );

    const [rows] =
        await pool.query(
            query,
            params
        );

    return rows;
};


const getMerchantSummary = async ({
    startDate,
    endDate,
    merchantId
}) => {

    const [rows] =
        await pool.query(
            `
            SELECT

                m.merchant_id,
                m.merchant_name,
                m.business_name,
                m.email,
                m.phone,
                m.website,
                m.merchant_code,
                m.account_status,
                m.kyc_status,

                COUNT(
                    t.transaction_id
                ) AS totalTransactions,

                SUM(
                    CASE
                        WHEN t.status = 'SUCCESS'
                        THEN 1
                        ELSE 0
                    END
                ) AS successfulTransactions,

                SUM(
                    CASE
                        WHEN t.status = 'FAILED'
                        THEN 1
                        ELSE 0
                    END
                ) AS failedTransactions,

                SUM(
                    CASE
                        WHEN t.status = 'PENDING'
                        THEN 1
                        ELSE 0
                    END
                ) AS pendingTransactions,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.status = 'SUCCESS'
                                THEN t.amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS totalRevenue,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.status = 'SUCCESS'
                                THEN t.gateway_fee
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS totalGatewayFee,

                ROUND(
                    COALESCE(
                        AVG(t.amount),
                        0
                    ),
                    2
                ) AS averageTransactionAmount

            FROM merchants m

            LEFT JOIN transactions t
                ON m.merchant_id = t.merchant_id
                AND t.created_at >= ?
                AND t.created_at <
                    DATE_ADD(
                        ?,
                        INTERVAL 1 DAY
                    )

            WHERE m.merchant_id = ?

            GROUP BY

                m.merchant_id,
                m.merchant_name,
                m.business_name,
                m.email,
                m.phone,
                m.website,
                m.merchant_code,
                m.account_status,
                m.kyc_status
            `,
            [
                startDate,
                endDate,
                merchantId
            ]
        );

    return rows[0] || {
        merchant_id: merchantId,
        merchant_name: "",
        business_name: "",
        email: "",
        phone: "",
        website: "",
        merchant_code: "",
        account_status: "",
        kyc_status: "",
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0,
        totalRevenue: 0,
        totalGatewayFee: 0,
        averageTransactionAmount: 0
    };
};


const getMerchantRevenueTrend = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [rows] =
        await pool.query(
            `
            SELECT

                DATE(created_at)
                    AS reportDate,

                COUNT(*)
                    AS totalTransactions,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN status = 'SUCCESS'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS revenue,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN status = 'SUCCESS'
                                THEN gateway_fee
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS gatewayFee

            FROM transactions

            WHERE merchant_id = ?

            AND created_at >= ?
            AND created_at <
                DATE_ADD(
                    ?,
                    INTERVAL 1 DAY
                )

            GROUP BY DATE(created_at)

            ORDER BY reportDate ASC
            `,
            [
                merchantId,
                startDate,
                endDate
            ]
        );

    return rows;
};


const getMerchantPaymentMethods = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [rows] =
        await pool.query(
            `
            SELECT

                payment_method,

                COUNT(*)
                    AS totalTransactions,

                SUM(
                    CASE
                        WHEN status = 'SUCCESS'
                        THEN 1
                        ELSE 0
                    END
                ) AS successfulTransactions,

                ROUND(
                    COALESCE(
                        SUM(amount),
                        0
                    ),
                    2
                ) AS totalAmount,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN status = 'SUCCESS'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS successfulAmount,

                ROUND(
                    COALESCE(
                        SUM(gateway_fee),
                        0
                    ),
                    2
                ) AS gatewayFee

            FROM transactions

            WHERE merchant_id = ?

            AND created_at >= ?
            AND created_at <
                DATE_ADD(
                    ?,
                    INTERVAL 1 DAY
                )

            GROUP BY payment_method

            ORDER BY totalTransactions DESC
            `,
            [
                merchantId,
                startDate,
                endDate
            ]
        );

    return rows;
};

const getMerchantRecentTransactions = async ({
    merchantId,
    startDate,
    endDate,
    page = 1,
    limit = 10
}) => {

    const currentPage =
        Math.max(
            Number(page) || 1,
            1
        );

    const currentLimit =
        Math.min(
            Math.max(
                Number(limit) || 10,
                1
            ),
            100
        );

    const offset =
        (currentPage - 1) *
        currentLimit;

    const [rows] =
        await pool.query(
            `
            SELECT

                t.transaction_id,
                t.transaction_ref,
                t.order_id,

                t.gateway_order_id,
                t.gateway_payment_id,
                t.gateway_reference,

                t.customer_name,
                t.customer_email,
                t.customer_phone,

                t.amount,
                t.merchant_fee,
                t.gateway_fee,
                t.gateway_tax,
                t.net_amount,

                t.currency,
                t.payment_method,
                t.payment_type,
                t.status,

                t.completion_source,
                t.settlement_status,

                t.created_at,
                t.completed_at,
                t.updated_at

            FROM transactions t

            WHERE t.merchant_id = ?

            AND t.created_at >= ?
            AND t.created_at <
                DATE_ADD(
                    ?,
                    INTERVAL 1 DAY
                )

            ORDER BY
                t.created_at DESC,
                t.transaction_id DESC

            LIMIT ?
            OFFSET ?
            `,
            [
                merchantId,
                startDate,
                endDate,
                currentLimit,
                offset
            ]
        );

    return rows;
};


const getMerchantTransactionCount = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [rows] =
        await pool.query(
            `
            SELECT
                COUNT(*) AS totalRecords

            FROM transactions

            WHERE merchant_id = ?

            AND created_at >= ?
            AND created_at <
                DATE_ADD(
                    ?,
                    INTERVAL 1 DAY
                )
            `,
            [
                merchantId,
                startDate,
                endDate
            ]
        );

    return Number(
        rows[0]?.totalRecords || 0
    );
};


const getMerchantRefundSummary = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [rows] =
        await pool.query(
            `
            SELECT

                COUNT(*) AS totalRefunds,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN refund_status = 'PROCESSED'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS refundAmount,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN refund_status = 'PROCESSED'
                                THEN fee_amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS refundFee,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN refund_status = 'PROCESSED'
                                THEN total_debit_amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS totalDebitAmount

            FROM transaction_refunds

            WHERE merchant_id = ?

            AND created_at >= ?
            AND created_at <
                DATE_ADD(
                    ?,
                    INTERVAL 1 DAY
                )
            `,
            [
                merchantId,
                startDate,
                endDate
            ]
        );

    return rows[0] || {
        totalRefunds: 0,
        refundAmount: 0,
        refundFee: 0,
        totalDebitAmount: 0
    };
};


const getMerchantRefundTrend = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [rows] =
        await pool.query(
            `
            SELECT

                DATE(created_at)
                    AS reportDate,

                COUNT(*) AS totalRefunds,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN refund_status = 'PROCESSED'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS refundAmount,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN refund_status = 'PROCESSED'
                                THEN fee_amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS refundFee,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN refund_status = 'PROCESSED'
                                THEN total_debit_amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS totalDebitAmount

            FROM transaction_refunds

            WHERE merchant_id = ?

            AND created_at >= ?
            AND created_at <
                DATE_ADD(
                    ?,
                    INTERVAL 1 DAY
                )

            GROUP BY DATE(created_at)

            ORDER BY reportDate ASC
            `,
            [
                merchantId,
                startDate,
                endDate
            ]
        );

    return rows;
};


const getSettlementSummary = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [rows] =
        await pool.query(
            `
            SELECT

                COUNT(*) AS totalSettlements,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN settlement_status = 'SETTLED'
                                THEN net_amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS settledAmount,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN settlement_status = 'PENDING'
                                THEN net_amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS pendingAmount,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN settlement_status = 'PROCESSING'
                                THEN net_amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS processingAmount,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN settlement_status = 'FAILED'
                                THEN net_amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS failedAmount

            FROM transactions

            WHERE merchant_id = ?

            AND created_at >= ?
            AND created_at <
                DATE_ADD(
                    ?,
                    INTERVAL 1 DAY
                )
            `,
            [
                merchantId,
                startDate,
                endDate
            ]
        );

    return rows[0] || {
        totalSettlements: 0,
        settledAmount: 0,
        pendingAmount: 0,
        processingAmount: 0,
        failedAmount: 0
    };
};


const getChargebackSummary = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [rows] =
        await pool.query(
            `
            SELECT

                COUNT(*) AS totalChargebacks,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN status = 'CHARGEBACK'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS chargebackAmount

            FROM transactions

            WHERE merchant_id = ?

            AND created_at >= ?
            AND created_at <
                DATE_ADD(
                    ?,
                    INTERVAL 1 DAY
                )
            `,
            [
                merchantId,
                startDate,
                endDate
            ]
        );

    return rows[0] || {
        totalChargebacks: 0,
        chargebackAmount: 0
    };
};


const getMerchantDailyTrend = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [rows] =
        await pool.query(
            `
            SELECT

                DATE(created_at)
                    AS reportDate,

                COUNT(*) AS totalTransactions,

                SUM(
                    CASE
                        WHEN status = 'SUCCESS'
                        THEN 1
                        ELSE 0
                    END
                ) AS successfulTransactions,

                SUM(
                    CASE
                        WHEN status = 'FAILED'
                        THEN 1
                        ELSE 0
                    END
                ) AS failedTransactions,

                SUM(
                    CASE
                        WHEN status = 'PENDING'
                        THEN 1
                        ELSE 0
                    END
                ) AS pendingTransactions,

                ROUND(
                    COALESCE(
                        SUM(
                            CASE
                                WHEN status = 'SUCCESS'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    2
                ) AS revenue

            FROM transactions

            WHERE merchant_id = ?

            AND created_at >= ?
            AND created_at <
                DATE_ADD(
                    ?,
                    INTERVAL 1 DAY
                )

            GROUP BY DATE(created_at)

            ORDER BY reportDate ASC
            `,
            [
                merchantId,
                startDate,
                endDate
            ]
        );

    return rows;
};


const getMerchantAnalytics = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [
        paymentMethods,
        dailyTrend,
        refunds,
        settlements,
        chargebacks
    ] = await Promise.all([

        getMerchantPaymentMethods({
            merchantId,
            startDate,
            endDate
        }),

        getMerchantDailyTrend({
            merchantId,
            startDate,
            endDate
        }),

        getMerchantRefundSummary({
            merchantId,
            startDate,
            endDate
        }),

        getSettlementSummary({
            merchantId,
            startDate,
            endDate
        }),

        getChargebackSummary({
            merchantId,
            startDate,
            endDate
        })

    ]);

    return {
        paymentMethods,
        dailyTrend,
        refunds,
        settlements,
        chargebacks
    };
};


const getMerchantDashboard = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [
        summary,
        analytics,
        transactions,
        totalRecords
    ] = await Promise.all([

        getMerchantSummary({
            merchantId,
            startDate,
            endDate
        }),

        getMerchantAnalytics({
            merchantId,
            startDate,
            endDate
        }),

        getMerchantRecentTransactions({
            merchantId,
            startDate,
            endDate,
            page: 1,
            limit: 10
        }),

        getMerchantTransactionCount({
            merchantId,
            startDate,
            endDate
        })

    ]);

    return {
        summary,
        analytics,
        transactions,
        totalRecords
    };
};
const getMerchantExportTransactions = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [rows] =
        await pool.query(
            `
            SELECT

                t.transaction_id,
                t.transaction_ref,

                t.merchant_id,

                m.merchant_name,
                m.business_name,

                t.order_id,
                t.gateway_order_id,
                t.gateway_payment_id,
                t.gateway_reference,

                t.customer_name,
                t.customer_email,
                t.customer_phone,

                t.amount,
                t.merchant_fee,
                t.gateway_fee,
                t.gateway_tax,
                t.net_amount,

                t.currency,
                t.payment_method,
                t.payment_type,
                t.status,

                t.completion_source,
                t.settlement_status,

                t.created_at,
                t.completed_at,
                t.updated_at

            FROM transactions t

            INNER JOIN merchants m
                ON m.merchant_id = t.merchant_id

            WHERE t.merchant_id = ?

            AND t.created_at >= ?
            AND t.created_at <
                DATE_ADD(
                    ?,
                    INTERVAL 1 DAY
                )

            ORDER BY
                t.created_at DESC,
                t.transaction_id DESC
            `,
            [
                merchantId,
                startDate,
                endDate
            ]
        );

    return rows;
};


const getRefundExportTransactions = async ({
    merchantId = null,
    startDate,
    endDate
}) => {

    let query = `
        SELECT

            tr.refund_id,
            tr.refund_reference,

            tr.request_id,
            tr.merchant_id,
            tr.transaction_id,

            m.merchant_name,
            m.business_name,

            tr.gateway_refund_id,
            tr.gateway_payment_id,
            tr.gateway_order_id,

            tr.amount,
            tr.fee_amount,
            tr.total_debit_amount,

            tr.currency,
            tr.refund_type,
            tr.refund_status,

            tr.refund_reason,
            tr.completion_source,

            tr.failure_code,
            tr.failure_message,

            tr.processed_at,
            tr.created_at,
            tr.updated_at

        FROM transaction_refunds tr

        INNER JOIN merchants m
            ON m.merchant_id = tr.merchant_id

        WHERE tr.created_at >= ?
        AND tr.created_at <
            DATE_ADD(
                ?,
                INTERVAL 1 DAY
            )
    `;

    const params = [
        startDate,
        endDate
    ];

    if (
        merchantId !== null &&
        merchantId !== undefined
    ) {

        query += `
            AND tr.merchant_id = ?
        `;

        params.push(merchantId);
    }

    query += `
        ORDER BY
            tr.created_at DESC,
            tr.refund_id DESC
    `;

    const [rows] =
        await pool.query(
            query,
            params
        );

    return rows;
};


const getSettlementExportTransactions = async ({
    merchantId = null,
    startDate,
    endDate
}) => {

    let query = `
        SELECT

            t.transaction_id,
            t.transaction_ref,

            t.merchant_id,

            m.merchant_name,
            m.business_name,

            t.order_id,

            t.amount,
            t.merchant_fee,
            t.gateway_fee,
            t.gateway_tax,
            t.net_amount,

            t.currency,

            t.payment_method,
            t.payment_type,
            t.status,

            t.settlement_status,
            t.settled_at,

            t.created_at,
            t.completed_at

        FROM transactions t

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE t.created_at >= ?
        AND t.created_at <
            DATE_ADD(
                ?,
                INTERVAL 1 DAY
            )
    `;

    const params = [
        startDate,
        endDate
    ];

    if (
        merchantId !== null &&
        merchantId !== undefined
    ) {

        query += `
            AND t.merchant_id = ?
        `;

        params.push(merchantId);
    }

    query += `
        ORDER BY
            t.created_at DESC,
            t.transaction_id DESC
    `;

    const [rows] =
        await pool.query(
            query,
            params
        );

    return rows;
};


const getChargebackExportTransactions = async ({
    merchantId = null,
    startDate,
    endDate
}) => {

    let query = `
        SELECT

            t.transaction_id,
            t.transaction_ref,

            t.merchant_id,

            m.merchant_name,
            m.business_name,

            t.order_id,

            t.customer_name,
            t.customer_email,
            t.customer_phone,

            t.amount,
            t.currency,

            t.payment_method,
            t.payment_type,

            t.status,

            t.gateway_order_id,
            t.gateway_payment_id,
            t.gateway_reference,

            t.failure_code,
            t.failure_message,

            t.created_at,
            t.completed_at,
            t.updated_at

        FROM transactions t

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE t.status = 'CHARGEBACK'

        AND t.created_at >= ?
        AND t.created_at <
            DATE_ADD(
                ?,
                INTERVAL 1 DAY
            )
    `;

    const params = [
        startDate,
        endDate
    ];

    if (
        merchantId !== null &&
        merchantId !== undefined
    ) {

        query += `
            AND t.merchant_id = ?
        `;

        params.push(merchantId);
    }

    query += `
        ORDER BY
            t.created_at DESC,
            t.transaction_id DESC
    `;

    const [rows] =
        await pool.query(
            query,
            params
        );

    return rows;
};


const getTransactionStatusSummary = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    let query = `
        SELECT

            status,

            COUNT(*) AS totalTransactions,

            ROUND(
                COALESCE(
                    SUM(amount),
                    0
                ),
                2
            ) AS totalAmount

        FROM transactions

        WHERE created_at >= ?
        AND created_at <
            DATE_ADD(
                ?,
                INTERVAL 1 DAY
            )
    `;

    const params = [
        startDate,
        endDate
    ];

    if (
        merchantId !== null &&
        merchantId !== undefined
    ) {

        query += `
            AND merchant_id = ?
        `;

        params.push(merchantId);
    }

    query += `
        GROUP BY status
        ORDER BY totalTransactions DESC
    `;

    const [rows] =
        await pool.query(
            query,
            params
        );

    return rows;
};


const getPaymentMethodSummary = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    let query = `
        SELECT

            payment_method,

            COUNT(*) AS totalTransactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successfulTransactions,

            ROUND(
                COALESCE(
                    SUM(amount),
                    0
                ),
                2
            ) AS totalAmount,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN status = 'SUCCESS'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS successfulAmount

        FROM transactions

        WHERE created_at >= ?
        AND created_at <
            DATE_ADD(
                ?,
                INTERVAL 1 DAY
            )
    `;

    const params = [
        startDate,
        endDate
    ];

    if (
        merchantId !== null &&
        merchantId !== undefined
    ) {

        query += `
            AND merchant_id = ?
        `;

        params.push(merchantId);
    }

    query += `
        GROUP BY payment_method
        ORDER BY totalTransactions DESC
    `;

    const [rows] =
        await pool.query(
            query,
            params
        );

    return rows;
};


const getPaymentTypeSummary = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    let query = `
        SELECT

            payment_type,

            COUNT(*) AS totalTransactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successfulTransactions,

            ROUND(
                COALESCE(
                    SUM(amount),
                    0
                ),
                2
            ) AS totalAmount,

            ROUND(
                COALESCE(
                    SUM(
                        CASE
                            WHEN status = 'SUCCESS'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ),
                2
            ) AS successfulAmount

        FROM transactions

        WHERE created_at >= ?
        AND created_at <
            DATE_ADD(
                ?,
                INTERVAL 1 DAY
            )
    `;

    const params = [
        startDate,
        endDate
    ];

    if (
        merchantId !== null &&
        merchantId !== undefined
    ) {

        query += `
            AND merchant_id = ?
        `;

        params.push(merchantId);
    }

    query += `
        GROUP BY payment_type
        ORDER BY totalTransactions DESC
    `;

    const [rows] =
        await pool.query(
            query,
            params
        );

    return rows;
};


module.exports = {

    getDailyTimeWindow,

    getMonthlyTimeWindow,

    getDailySummary,

    getHourlyTransactions,

    getDailyTransactions,

    getDailyTransactionsCount,

    getPaymentMethodDistribution,

    getPaymentTypeDistribution,

    getExportTransactions,

    getMonthlySummary,

    getMonthlyRevenueTrend,

    getMonthlyTransactionTrend,

    getMonthlyRefundTrend,

    getTopMerchants,

    getMerchantSummary,

    getMerchantRevenueTrend,

    getMerchantPaymentMethods,

    getMerchantRecentTransactions,

    getMerchantTransactionCount,

    getMerchantRefundSummary,

    getMerchantRefundTrend,

    getSettlementSummary,

    getChargebackSummary,

    getMerchantDailyTrend,

    getMerchantAnalytics,

    getMerchantDashboard,

    getMerchantExportTransactions,

    getRefundExportTransactions,

    getSettlementExportTransactions,

    getChargebackExportTransactions,

    getTransactionStatusSummary,

    getPaymentMethodSummary,

    getPaymentTypeSummary
};