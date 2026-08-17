const DASHBOARD_ANALYTICS_QUERIES = {


    // ==================================================
    // Revenue Trend
    // ==================================================

    GET_REVENUE_TREND: `

    SELECT

        DATE_FORMAT(created_at, '%Y-%m-%d') AS date,

        COALESCE(SUM(amount),0) AS revenue


    FROM transactions


    WHERE merchant_id = ?

    AND status = 'SUCCESS'


    GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')


    ORDER BY date ASC

`,



    // ==================================================
    // Payment Method Distribution
    // ==================================================

    GET_PAYMENT_METHOD_DISTRIBUTION: `

        SELECT

            payment_method,

            COUNT(*) AS total_transactions,

            COALESCE(SUM(amount),0) AS total_amount


        FROM transactions


        WHERE merchant_id = ?


        AND status = 'SUCCESS'


        GROUP BY payment_method


        ORDER BY total_transactions DESC

    `,



    // ==================================================
    // Payment Status Distribution
    // ==================================================

    GET_PAYMENT_STATUS_DISTRIBUTION: `

        SELECT

            status,

            COUNT(*) AS total_transactions


        FROM transactions


        WHERE merchant_id = ?


        GROUP BY status

    `,



    // ==================================================
    // Success Rate
    // ==================================================

    GET_PAYMENT_SUCCESS_RATE: `

        SELECT


            COUNT(*) AS total_transactions,


            SUM(

                CASE

                    WHEN status = 'SUCCESS'

                    THEN 1

                    ELSE 0

                END

            ) AS successful_transactions


        FROM transactions


        WHERE merchant_id = ?

    `,



    // ==================================================
    // Average Transaction Amount
    // ==================================================

    GET_AVERAGE_TRANSACTION_AMOUNT: `

        SELECT

            COALESCE(

                AVG(amount),

                0

            ) AS average_amount


        FROM transactions


        WHERE merchant_id = ?

        AND status = 'SUCCESS'

    `



};



module.exports = DASHBOARD_ANALYTICS_QUERIES;