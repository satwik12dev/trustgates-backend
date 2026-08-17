const pool = require("../../../config/pool");

/**
 * ===========================================================
 * DAILY SUMMARY
 * ===========================================================
 */

const getDailySummary = async ({
    date,
    merchantId = null,
    paymentType = null,
    paymentMethod = null,
    status = null
}) => {


    let query = `
        SELECT

            COUNT(*) AS totalTransactions,

            SUM(CASE WHEN t.status = 'SUCCESS' THEN 1 ELSE 0 END) AS successfulTransactions,

            SUM(CASE WHEN t.status = 'FAILED' THEN 1 ELSE 0 END) AS failedTransactions,

            SUM(CASE WHEN t.status = 'PENDING' THEN 1 ELSE 0 END) AS pendingTransactions,

            SUM(CASE WHEN t.status = 'CHARGEBACK' THEN 1 ELSE 0 END) AS chargebackTransactions,

            ROUND(IFNULL(SUM(CASE
                WHEN t.status='SUCCESS'
                THEN t.amount
                ELSE 0
            END),0),2) AS totalRevenue,

            ROUND(IFNULL(SUM(t.gateway_fee),0),2) AS totalGatewayFee,

            ROUND(IFNULL(AVG(t.amount),0),2) AS averageTransactionAmount

        FROM transactions t

        WHERE DATE(t.created_at)=?
    `;

    const formattedDate = new Date(date)
        .toISOString()
        .split("T")[0];

    const params = [formattedDate];
 // 2026-07-18
    if (merchantId) {
        query += " AND t.merchant_id=?";
        params.push(merchantId);
    }

    if (paymentType) {
        query += " AND t.payment_type=?";
        params.push(paymentType);
    }

    if (paymentMethod) {
        query += " AND t.payment_method=?";
        params.push(paymentMethod);
    }

    if (status) {
        query += " AND t.status=?";
        params.push(status);
    }

    const [rows] = await pool.query(query, params);

    return rows[0];
};


/**
 * ===========================================================
 * HOURLY TRANSACTIONS
 * ===========================================================
 */
const getHourlyTransactions = async ({
    date,
    merchantId = null
}) => {

    let query = `
        SELECT
            HOUR(created_at) AS hour,
            COUNT(*) AS totalTransactions,
            ROUND(IFNULL(SUM(amount),0),2) AS totalAmount
        FROM transactions
        WHERE DATE(created_at)=?
    `;

    const formattedDate =
        typeof date === "string"
            ? date
            : date.toISOString().slice(0, 10);

    const params = [formattedDate];

    if (merchantId) {
        query += " AND merchant_id=?";
        params.push(merchantId);
    }

    query += `
        GROUP BY HOUR(created_at)
        ORDER BY HOUR(created_at)
    `;

    const [rows] = await pool.query(query, params);

    return rows;
};


/**
 * ===========================================================
 * DAILY TRANSACTIONS
 * ===========================================================
 */

const getDailyTransactions = async ({
    date,
    merchantId = null,
    paymentMethod = null,
    paymentType = null,
    status = null,
    page = 1,
    limit = 20
}) => {

    const offset = (page - 1) * limit;

    let query = `

        SELECT

            t.transaction_id,

            t.order_id,

            m.merchant_name,

            m.business_name,

            t.customer_name,

            t.customer_email,

            t.amount,

            t.gateway_fee,

            t.currency,

            t.payment_method,

            t.payment_type,

            t.status,

            t.created_at

        FROM transactions t

        INNER JOIN merchants m

        ON t.merchant_id = m.merchant_id

        WHERE DATE(t.created_at)=?

    `;
    const formattedDate =
        typeof date === "string"
            ? date
            : date.toISOString().slice(0, 10);

    const params = [formattedDate];


    if (merchantId) {

        query += " AND t.merchant_id=?";

        params.push(merchantId);

    }

    if (paymentMethod) {

        query += " AND t.payment_method=?";

        params.push(paymentMethod);

    }

    if (paymentType) {

        query += " AND t.payment_type=?";

        params.push(paymentType);

    }

    if (status) {

        query += " AND t.status=?";

        params.push(status);

    }

    query += `

        ORDER BY t.created_at DESC

        LIMIT ?

        OFFSET ?

    `;

    params.push(Number(limit));

    params.push(Number(offset));

    const [rows] = await pool.query(query, params);

    return rows;
};


/**
 * ===========================================================
 * PAYMENT METHOD DISTRIBUTION
 * ===========================================================
 */

const getPaymentMethodDistribution = async ({
    date,
    merchantId = null
}) => {

    let query = `

        SELECT

            payment_method,

            COUNT(*) AS totalTransactions,

            ROUND(IFNULL(SUM(amount),0),2) AS totalAmount

        FROM transactions

        WHERE DATE(created_at)=?

    `;

    const formattedDate =
        typeof date === "string"
            ? date
            : date.toISOString().slice(0, 10);

    const params = [formattedDate];


    if (merchantId) {

        query += " AND merchant_id=?";

        params.push(merchantId);

    }

    query += `

        GROUP BY payment_method

        ORDER BY totalTransactions DESC

    `;


    const [rows] = await pool.query(query, params);


    return rows;
};


/**
 * ===========================================================
 * PAYMENT TYPE DISTRIBUTION
 * ===========================================================
 */

const getPaymentTypeDistribution = async ({
    date,
    merchantId = null
}) => {

    let query = `

        SELECT

            payment_type,

            COUNT(*) AS totalTransactions,

            ROUND(IFNULL(SUM(amount),0),2) AS totalAmount

        FROM transactions

        WHERE DATE(created_at)=?

    `;
    const formattedDate =
        typeof date === "string"
            ? date
            : date.toISOString().slice(0, 10);

    const params = [formattedDate];


    if (merchantId) {

        query += " AND merchant_id=?";

        params.push(merchantId);

    }

    query += `

        GROUP BY payment_type

        ORDER BY totalTransactions DESC

    `;


    const [rows] = await pool.query(query, params);


    return rows;
};
/**
 * ===========================================================
 * MONTHLY SUMMARY
 * ===========================================================
 */

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

            SUM(CASE WHEN status='SUCCESS' THEN 1 ELSE 0 END) AS successfulTransactions,

            SUM(CASE WHEN status='FAILED' THEN 1 ELSE 0 END) AS failedTransactions,

            SUM(CASE WHEN status='PENDING' THEN 1 ELSE 0 END) AS pendingTransactions,

            SUM(CASE WHEN status='CHARGEBACK' THEN 1 ELSE 0 END) AS chargebackTransactions,

            ROUND(IFNULL(SUM(CASE
                WHEN status='SUCCESS'
                THEN amount
                ELSE 0
            END),0),2) AS totalRevenue,

            ROUND(IFNULL(SUM(gateway_fee),0),2) AS totalGatewayFee,

            ROUND(IFNULL(AVG(amount),0),2) AS averageTransactionAmount

        FROM transactions

        WHERE MONTH(created_at)=?

        AND YEAR(created_at)=?

    `;

    const params = [month, year];

    if (merchantId) {
        query += " AND merchant_id=?";
        params.push(merchantId);
    }

    if (paymentType) {
        query += " AND payment_type=?";
        params.push(paymentType);
    }

    if (paymentMethod) {
        query += " AND payment_method=?";
        params.push(paymentMethod);
    }

    const [rows] = await pool.query(query, params);

    return rows[0];

};


/**
 * ===========================================================
 * MONTHLY REVENUE TREND
 * ===========================================================
 */

const getMonthlyRevenueTrend = async ({
    month,
    year,
    merchantId = null
}) => {

    let query = `

        SELECT

            DAY(created_at) AS day,

            ROUND(IFNULL(SUM(amount),0),2) AS revenue,

            COUNT(*) AS totalTransactions

        FROM transactions

        WHERE status='SUCCESS'

        AND MONTH(created_at)=?

        AND YEAR(created_at)=?

    `;

    const params = [month, year];

    if (merchantId) {

        query += " AND merchant_id=?";

        params.push(merchantId);

    }

    query += `

        GROUP BY DAY(created_at)

        ORDER BY day

    `;

    const [rows] = await pool.query(query, params);

    return rows;

};


/**
 * ===========================================================
 * MONTHLY TRANSACTION TREND
 * ===========================================================
 */

const getMonthlyTransactionTrend = async ({
    month,
    year,
    merchantId = null
}) => {

    let query = `

        SELECT

            DAY(created_at) AS day,

            COUNT(*) AS totalTransactions,

            SUM(CASE WHEN status='SUCCESS' THEN 1 ELSE 0 END) AS successful,

            SUM(CASE WHEN status='FAILED' THEN 1 ELSE 0 END) AS failed,

            SUM(CASE WHEN status='PENDING' THEN 1 ELSE 0 END) AS pending

        FROM transactions

        WHERE MONTH(created_at)=?

        AND YEAR(created_at)=?

    `;

    const params = [month, year];

    if (merchantId) {

        query += " AND merchant_id=?";

        params.push(merchantId);

    }

    query += `

        GROUP BY DAY(created_at)

        ORDER BY day

    `;

    const [rows] = await pool.query(query, params);

    return rows;

};


/**
 * ===========================================================
 * MONTHLY REFUND TREND
 * ===========================================================
 */

const getMonthlyRefundTrend = async ({
    month,
    year,
    merchantId = null
}) => {

    let query = `

        SELECT

            DAY(created_at) AS day,

            COUNT(*) AS totalRefunds,

            ROUND(IFNULL(SUM(refund_amount),0),2) AS refundAmount

        FROM transaction_refunds

        WHERE MONTH(created_at)=?

        AND YEAR(created_at)=?

    `;

    const params = [month, year];

    if (merchantId) {

        query += " AND merchant_id=?";

        params.push(merchantId);

    }

    query += `

        GROUP BY DAY(created_at)

        ORDER BY day

    `;

    const [rows] = await pool.query(query, params);

    return rows;

};


/**
 * ===========================================================
 * TOP MERCHANTS
 * ===========================================================
 */

const getTopMerchants = async ({
    month,
    year,
    limit = 10
}) => {

    const [rows] = await pool.query(

        `

        SELECT

            m.merchant_id,

            m.merchant_name,

            m.business_name,

            m.merchant_code,

            COUNT(t.transaction_id) AS totalTransactions,

            ROUND(IFNULL(SUM(
                CASE
                    WHEN t.status='SUCCESS'
                    THEN t.amount
                    ELSE 0
                END
            ),0),2) AS revenue,

            ROUND(IFNULL(SUM(t.gateway_fee),0),2) AS gatewayFee

        FROM merchants m

        INNER JOIN transactions t

        ON m.merchant_id=t.merchant_id

        WHERE MONTH(t.created_at)=?

        AND YEAR(t.created_at)=?

        GROUP BY

            m.merchant_id,
            m.merchant_name,
            m.business_name,
            m.merchant_code

        ORDER BY revenue DESC

        LIMIT ?

        `,

        [month, year, Number(limit)]

    );

    return rows;

};

/**
 * ===========================================================
 * MERCHANT SUMMARY
 * ===========================================================
 */

const getMerchantSummary = async ({
    startDate,
    endDate,
    merchantId
}) => {
    const formattedStartDate =
    startDate instanceof Date
        ? startDate.toISOString().split("T")[0]
        : startDate;

const formattedEndDate =
    endDate instanceof Date
        ? endDate.toISOString().split("T")[0]
        : endDate;

    const [rows] = await pool.query(

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

            COUNT(t.transaction_id) AS totalTransactions,

            SUM(CASE
                WHEN t.status='SUCCESS'
                THEN 1 ELSE 0
            END) AS successfulTransactions,

            SUM(CASE
                WHEN t.status='FAILED'
                THEN 1 ELSE 0
            END) AS failedTransactions,

            SUM(CASE
                WHEN t.status='PENDING'
                THEN 1 ELSE 0
            END) AS pendingTransactions,

            ROUND(IFNULL(SUM(
                CASE
                    WHEN t.status='SUCCESS'
                    THEN t.amount
                    ELSE 0
                END
            ),0),2) AS totalRevenue,

            ROUND(IFNULL(SUM(t.gateway_fee),0),2) AS totalGatewayFee,

            ROUND(IFNULL(AVG(t.amount),0),2) AS averageTransactionAmount

        FROM merchants m


LEFT JOIN transactions t
    ON m.merchant_id = t.merchant_id
    AND DATE(t.created_at) BETWEEN ? AND ?

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
    formattedStartDate,
    formattedEndDate,
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



/**
 * ===========================================================
 * MERCHANT REVENUE TREND
 * ===========================================================
 */

const getMerchantRevenueTrend = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [rows] = await pool.query(

        `
        SELECT

            DATE(created_at) AS reportDate,

            COUNT(*) AS totalTransactions,

            ROUND(IFNULL(SUM(
                CASE
                    WHEN status='SUCCESS'
                    THEN amount
                    ELSE 0
                END
            ),0),2) AS revenue,

            ROUND(IFNULL(SUM(gateway_fee),0),2) AS gatewayFee

        FROM transactions

        WHERE merchant_id=?

        AND DATE(created_at)
            BETWEEN ? AND ?

        GROUP BY DATE(created_at)

        ORDER BY DATE(created_at)

        `,

        [
            merchantId,
            startDate,
            endDate
        ]

    );

    return rows;

};



/**
 * ===========================================================
 * MERCHANT PAYMENT METHODS
 * ===========================================================
 */

const getMerchantPaymentMethods = async ({
    merchantId,
    startDate,
    endDate
}) => {

    const [rows] = await pool.query(

        `
        SELECT

            payment_method,

            COUNT(*) AS totalTransactions,

            ROUND(IFNULL(SUM(amount),0),2) AS totalAmount,

            ROUND(IFNULL(SUM(gateway_fee),0),2) AS gatewayFee

        FROM transactions

        WHERE merchant_id=?

        AND DATE(created_at)
            BETWEEN ? AND ?

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



/**
 * ===========================================================
 * MERCHANT RECENT TRANSACTIONS
 * ===========================================================
 */

const getMerchantRecentTransactions = async ({
    merchantId,
    page = 1,
    limit = 20
}) => {

    const offset = (page - 1) * limit;

    const [rows] = await pool.query(

        `
        SELECT

            transaction_id,
            order_id,
            provider_payment_id,
            customer_name,
            customer_email,
            amount,
            gateway_fee,
            currency,
            payment_method,
            payment_type,
            status,
            created_at

        FROM transactions

        WHERE merchant_id=?

        ORDER BY created_at DESC

        LIMIT ?

        OFFSET ?

        `,

        [
            merchantId,
            Number(limit),
            Number(offset)
        ]

    );

    return rows;

};



/**
 * ===========================================================
 * MERCHANT SETTLEMENT SUMMARY
 * ===========================================================
 */

const getMerchantSettlementSummary = async ({
    merchantId,
    startDate,
    endDate
}) => {
    const formattedStartDate =
    startDate instanceof Date
        ? startDate.toISOString().split("T")[0]
        : startDate;

const formattedEndDate =
    endDate instanceof Date
        ? endDate.toISOString().split("T")[0]
        : endDate;
    const [rows] = await pool.query(

    `
    SELECT

        COUNT(*) AS totalSettlements,

        ROUND(IFNULL(SUM(gross_amount),0),2) AS grossAmount,

        ROUND(IFNULL(SUM(gateway_fee),0),2) AS gatewayFee,

        ROUND(IFNULL(SUM(gst),0),2) AS gst,

        ROUND(IFNULL(SUM(tds),0),2) AS tds,

        ROUND(IFNULL(SUM(net_amount),0),2) AS netAmount,

        IFNULL(SUM(
            CASE
                WHEN settlement_status='SETTLED'
                THEN 1
                ELSE 0
            END
        ),0) AS settledCount,

        IFNULL(SUM(
            CASE
                WHEN settlement_status='PROCESSING'
                THEN 1
                ELSE 0
            END
        ),0) AS processingCount,

        IFNULL(SUM(
            CASE
                WHEN settlement_status='PENDING'
                THEN 1
                ELSE 0
            END
        ),0) AS pendingCount

    FROM transaction_settlements

    WHERE merchant_id = ?

    AND settlement_date BETWEEN ? AND ?

    `,

    [
        merchantId,
        formattedStartDate,
        formattedEndDate
    ]

);

    return rows[0] || {

        totalSettlements: 0,

        grossAmount: 0,

        gatewayFee: 0,

        gst: 0,

        tds: 0,

        netAmount: 0,

        settledCount: 0,

        processingCount: 0,

        pendingCount: 0

    };

};


/**
 * ===========================================================
 * MERCHANT REFUND SUMMARY
 * ===========================================================
 */

const getMerchantRefundSummary = async ({
    merchantId,
    startDate,
    endDate
}) => {
    const formattedStartDate =
    startDate instanceof Date
        ? startDate.toISOString().split("T")[0]
        : startDate;

const formattedEndDate =
    endDate instanceof Date
        ? endDate.toISOString().split("T")[0]
        : endDate;
    const [rows] = await pool.query(

        `
        SELECT

            COUNT(*) AS totalRefunds,

            ROUND(IFNULL(SUM(refund_amount),0),2) AS refundAmount,

            IFNULL(SUM(
                CASE
                    WHEN refund_status='PROCESSED'
                    THEN 1
                    ELSE 0
                END
            ),0) AS processedRefunds,

            IFNULL(SUM(
                CASE
                    WHEN refund_status='FAILED'
                    THEN 1
                    ELSE 0
                END
            ),0) AS failedRefunds,

            IFNULL(SUM(
                CASE
                    WHEN refund_status='PENDING'
                    THEN 1
                    ELSE 0
                END
            ),0) AS pendingRefunds

        FROM transaction_refunds

        WHERE merchant_id = ?

        AND DATE(created_at)
            BETWEEN ? AND ?

        `,

        [
    merchantId,
    formattedStartDate,
    formattedEndDate
]

    );

    return rows[0] || {

        totalRefunds: 0,

        refundAmount: 0,

        processedRefunds: 0,

        failedRefunds: 0,

        pendingRefunds: 0

    };

};

/**
 * ===========================================================
 * REFUND REPORT
 * ===========================================================
 */

const getRefundReport = async ({
    startDate,
    endDate,
    merchantId = null,
    refundStatus = null,
    page = 1,
    limit = 20
}) => {

    const offset = (page - 1) * limit;

    let query = `

        SELECT

            tr.refund_id,

            tr.transaction_id,

            tr.refund_amount,

            tr.refund_reason,

            tr.refund_status,

            tr.created_at,

            t.order_id,

            t.payment_method,

            t.payment_type,

            t.customer_name,

            t.customer_email,

            m.merchant_name,

            m.business_name

        FROM transaction_refunds tr

        INNER JOIN transactions t
            ON tr.transaction_id=t.transaction_id

        INNER JOIN merchants m
            ON tr.merchant_id=m.merchant_id

        WHERE DATE(tr.created_at)
            BETWEEN ? AND ?

    `;

    const params = [startDate, endDate];

    if (merchantId) {
        query += " AND tr.merchant_id=?";
        params.push(merchantId);
    }

    if (refundStatus) {
        query += " AND tr.refund_status=?";
        params.push(refundStatus);
    }

    query += `

        ORDER BY tr.created_at DESC

        LIMIT ?

        OFFSET ?

    `;

    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, params);

    return rows;

};



/**
 * ===========================================================
 * SETTLEMENT REPORT
 * ===========================================================
 */

const getSettlementReport = async ({
    startDate,
    endDate,
    merchantId = null,
    settlementStatus = null,
    page = 1,
    limit = 20
}) => {

    const offset = (page - 1) * limit;

    const formattedStartDate =
        startDate instanceof Date
            ? startDate.toISOString().split("T")[0]
            : startDate;

    const formattedEndDate =
        endDate instanceof Date
            ? endDate.toISOString().split("T")[0]
            : endDate;

    let query = `

        SELECT

            s.settlement_id,

            s.transaction_id,

            t.order_id,

            m.merchant_id,

            m.merchant_name,

            m.business_name,

            t.customer_name,

            t.customer_email,

            t.payment_method,

            t.payment_type,

            t.currency,

            t.amount AS transaction_amount,

            s.gross_amount,

            s.gateway_fee,

            s.gst,

            s.tds,

            s.net_amount,

            s.settlement_status,

            s.settlement_date,

            s.created_at

        FROM transaction_settlements s

        INNER JOIN transactions t
            ON s.transaction_id = t.transaction_id

        INNER JOIN merchants m
            ON s.merchant_id = m.merchant_id

        WHERE DATE(s.settlement_date)
            BETWEEN ? AND ?

    `;

    const params = [
        formattedStartDate,
        formattedEndDate
    ];

    if (merchantId) {

        query += " AND s.merchant_id = ?";

        params.push(merchantId);

    }

    if (settlementStatus) {

        query += " AND s.settlement_status = ?";

        params.push(settlementStatus);

    }

    query += `

        ORDER BY
            s.settlement_date DESC,
            s.settlement_id DESC

        LIMIT ?

        OFFSET ?

    `;

    params.push(
        Number(limit),
        Number(offset)
    );

    const [rows] = await pool.query(query, params);
    return rows;
};

/**
 * ===========================================================
 * CHARGEBACK REPORT
 * ===========================================================
 */

const getChargebackReport = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    let query = `

        SELECT

            t.transaction_id,

            t.order_id,

            t.customer_name,

            t.customer_email,

            t.amount,

            t.payment_method,

            t.payment_type,

            t.created_at,

            m.merchant_name,

            m.business_name

        FROM transactions t

        INNER JOIN merchants m

            ON t.merchant_id=m.merchant_id

        WHERE t.status='CHARGEBACK'

        AND DATE(t.created_at)
            BETWEEN ? AND ?

    `;

    const params = [startDate, endDate];

    if (merchantId) {

        query += " AND t.merchant_id=?";

        params.push(merchantId);

    }

    query += " ORDER BY t.created_at DESC";

    const [rows] = await pool.query(query, params);

    return rows;

};



/**
 * ===========================================================
 * GATEWAY FEE REPORT
 * ===========================================================
 */

const getGatewayFeeReport = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    let query = `

        SELECT

            m.merchant_name,

            m.business_name,

            COUNT(t.transaction_id) totalTransactions,

            ROUND(IFNULL(SUM(t.amount),0),2) totalAmount,

            ROUND(IFNULL(SUM(t.gateway_fee),0),2) totalGatewayFee

        FROM transactions t

        INNER JOIN merchants m

            ON t.merchant_id=m.merchant_id

        WHERE DATE(t.created_at)
            BETWEEN ? AND ?

    `;

    const params = [startDate, endDate];

    if (merchantId) {

        query += " AND t.merchant_id=?";

        params.push(merchantId);

    }

    query += `

        GROUP BY

            m.merchant_id,
            m.merchant_name,
            m.business_name

        ORDER BY totalGatewayFee DESC

    `;

    const [rows] = await pool.query(query, params);

    return rows;

};



/**
 * ===========================================================
 * EXPORT TRANSACTIONS
 * ===========================================================
 */

const getExportTransactions = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    console.log("Export Filters:", {
    startDate,
    endDate,
    merchantId
});
    let query = `

        SELECT

            t.transaction_id,

            t.order_id,

            m.merchant_name,

            m.business_name,

            t.customer_name,

            t.customer_email,

            t.amount,

            t.gateway_fee,

            t.currency,

            t.payment_method,

            t.payment_type,

            t.status,

            t.provider_payment_id,

            t.created_at

        FROM transactions t

        INNER JOIN merchants m

            ON t.merchant_id=m.merchant_id

        WHERE DATE(t.created_at)
            BETWEEN ? AND ?

    `;
    const formattedStartDate = new Date(startDate)
    .toISOString()
    .slice(0, 10);

const formattedEndDate = new Date(endDate)
    .toISOString()
    .slice(0, 10);

    const params = [formattedStartDate, formattedEndDate];

    if (merchantId) {

        query += " AND t.merchant_id=?";

        params.push(merchantId);

    }

    const start = new Date(startDate);
const end = new Date(endDate);

console.log("Parsed Dates:", {
    start,
    end,
    startValid: !isNaN(start.getTime()),
    endValid: !isNaN(end.getTime())
});
    query += " ORDER BY t.created_at DESC";

    const [rows] = await pool.query(query, params);

    return rows;

};

/**
 * ===========================================================
 * UPI REPORT
 * ===========================================================
 */

const getUPIReport = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    let query = `

        SELECT

            t.transaction_id,
            t.order_id,
            m.merchant_name,
            t.customer_name,
            t.amount,
            t.status,
            u.vpa,
            u.upi_app,
            u.bank_name,
            t.created_at

        FROM transaction_upi u

        INNER JOIN transactions t
            ON u.transaction_id = t.transaction_id

        INNER JOIN merchants m
            ON t.merchant_id = m.merchant_id

        WHERE DATE(t.created_at)
            BETWEEN ? AND ?

    `;

    const params = [startDate, endDate];

    if (merchantId) {
        query += " AND t.merchant_id=?";
        params.push(merchantId);
    }

    query += " ORDER BY t.created_at DESC";

    const [rows] = await pool.query(query, params);

    return rows;

};


/**
 * ===========================================================
 * CARD REPORT
 * ===========================================================
 */

const getCardReport = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    let query = `

        SELECT

            t.transaction_id,
            t.order_id,
            m.merchant_name,
            t.customer_name,
            t.amount,
            t.status,
            c.card_network,
            c.card_type,
            c.last_four_digits,
            c.issuing_bank,
            t.created_at

        FROM transaction_card c

        INNER JOIN transactions t
            ON c.transaction_id=t.transaction_id

        INNER JOIN merchants m
            ON t.merchant_id=m.merchant_id

        WHERE DATE(t.created_at)
            BETWEEN ? AND ?

    `;

    const params = [startDate, endDate];

    if (merchantId) {
        query += " AND t.merchant_id=?";
        params.push(merchantId);
    }

    query += " ORDER BY t.created_at DESC";

    const [rows] = await pool.query(query, params);

    return rows;

};


/**
 * ===========================================================
 * WALLET REPORT
 * ===========================================================
 */

const getWalletReport = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    let query = `

        SELECT

            t.transaction_id,
            t.order_id,
            m.merchant_name,
            t.customer_name,
            t.amount,
            t.status,
            w.wallet_provider,
            w.wallet_mobile,
            t.created_at

        FROM transaction_wallet w

        INNER JOIN transactions t
            ON w.transaction_id=t.transaction_id

        INNER JOIN merchants m
            ON t.merchant_id=m.merchant_id

        WHERE DATE(t.created_at)
            BETWEEN ? AND ?

    `;

    const params = [startDate, endDate];

    if (merchantId) {
        query += " AND t.merchant_id=?";
        params.push(merchantId);
    }

    query += " ORDER BY t.created_at DESC";

    const [rows] = await pool.query(query, params);

    return rows;

};


/**
 * ===========================================================
 * NET BANKING REPORT
 * ===========================================================
 */

const getNetBankingReport = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    let query = `

        SELECT

            t.transaction_id,
            t.order_id,
            m.merchant_name,
            t.customer_name,
            t.amount,
            t.status,
            n.bank_name,
            n.reference_number,
            t.created_at

        FROM transaction_netbanking n

        INNER JOIN transactions t
            ON n.transaction_id=t.transaction_id

        INNER JOIN merchants m
            ON t.merchant_id=m.merchant_id

        WHERE DATE(t.created_at)
            BETWEEN ? AND ?

    `;

    const params = [startDate, endDate];

    if (merchantId) {
        query += " AND t.merchant_id=?";
        params.push(merchantId);
    }

    query += " ORDER BY t.created_at DESC";

    const [rows] = await pool.query(query, params);

    return rows;

};


/**
 * ===========================================================
 * EMI REPORT
 * ===========================================================
 */

const getEMIReport = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    let query = `

        SELECT

            t.transaction_id,
            t.order_id,
            m.merchant_name,
            t.customer_name,
            t.amount,
            t.status,
            e.bank_name,
            e.emi_tenure,
            e.interest_rate,
            t.created_at

        FROM transaction_emi e

        INNER JOIN transactions t
            ON e.transaction_id=t.transaction_id

        INNER JOIN merchants m
            ON t.merchant_id=m.merchant_id

        WHERE DATE(t.created_at)
            BETWEEN ? AND ?

    `;

    const params = [startDate, endDate];

    if (merchantId) {
        query += " AND t.merchant_id=?";
        params.push(merchantId);
    }

    query += " ORDER BY t.created_at DESC";

    const [rows] = await pool.query(query, params);

    return rows;

};


/**
 * ===========================================================
 * PAY LATER REPORT
 * ===========================================================
 */

const getPayLaterReport = async ({
    startDate,
    endDate,
    merchantId = null
}) => {

    let query = `

        SELECT

            t.transaction_id,
            t.order_id,
            m.merchant_name,
            t.customer_name,
            t.amount,
            t.status,
            p.provider_name,
            p.loan_reference,
            t.created_at

        FROM transaction_paylater p

        INNER JOIN transactions t
            ON p.transaction_id=t.transaction_id

        INNER JOIN merchants m
            ON t.merchant_id=m.merchant_id

        WHERE DATE(t.created_at)
            BETWEEN ? AND ?

    `;

    const params = [startDate, endDate];

    if (merchantId) {
        query += " AND t.merchant_id=?";
        params.push(merchantId);
    }

    query += " ORDER BY t.created_at DESC";

    const [rows] = await pool.query(query, params);

    return rows;
};

module.exports = {

    // ==========================
    // Daily Reports
    // ==========================
    getDailySummary,
    getHourlyTransactions,
    getDailyTransactions,
    getPaymentMethodDistribution,
    getPaymentTypeDistribution,

    // ==========================
    // Monthly Reports
    // ==========================
    getMonthlySummary,
    getMonthlyRevenueTrend,
    getMonthlyTransactionTrend,
    getMonthlyRefundTrend,
    getTopMerchants,

    // ==========================
    // Merchant Reports
    // ==========================
    getMerchantSummary,
    getMerchantRevenueTrend,
    getMerchantPaymentMethods,
    getMerchantRecentTransactions,
    getMerchantSettlementSummary,
    getMerchantRefundSummary,

    // ==========================
    // Refund / Settlement Reports
    // ==========================
    getRefundReport,
    getSettlementReport,
    getChargebackReport,
    getGatewayFeeReport,

    // ==========================
    // Export Reports
    // ==========================
    getExportTransactions,

    // ==========================
    // Payment Method Reports
    // ==========================
    getUPIReport,
    getCardReport,
    getWalletReport,
    getNetBankingReport,
    getEMIReport,
    getPayLaterReport

};
