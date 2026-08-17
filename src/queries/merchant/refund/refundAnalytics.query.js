const REFUND_ANALYTICS_QUERIES = {


    SUMMARY: `


        SELECT


        COUNT(*) AS total_refunds,


        COALESCE(
            SUM(approved_amount),
            0
        ) AS total_refund_amount,


        SUM(
            status = 'COMPLETED'
        ) AS completed_refunds,


        SUM(
            status = 'PROCESSING'
        ) AS processing_refunds,


        SUM(
            status = 'FAILED'
        ) AS failed_refunds,


        SUM(
            refund_type = 'FULL'
        ) AS full_refunds,


        SUM(
            refund_type = 'PARTIAL'
        ) AS partial_refunds



        FROM refund_requests


        WHERE merchant_id = ?



    `,



    MONTHLY_TREND: `


        SELECT


        DATE_FORMAT(
            created_at,
            '%Y-%m'
        ) AS month,


        COUNT(*) AS refunds,


        SUM(approved_amount) AS amount



        FROM refund_requests


        WHERE merchant_id = ?


        GROUP BY month


        ORDER BY month ASC



    `


};



module.exports = REFUND_ANALYTICS_QUERIES;