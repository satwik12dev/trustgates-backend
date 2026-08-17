const REFUND_DASHBOARD_QUERIES = {


    // ==================================================
    // Refund Overview Summary
    // ==================================================

    GET_REFUND_SUMMARY: `

        SELECT

            COUNT(*) AS total_refunds,


            COALESCE(

                SUM(amount),

                0

            ) AS total_refund_amount,


            SUM(

                CASE

                    WHEN refund_status = 'PROCESSED'

                    THEN 1

                    ELSE 0

                END

            ) AS completed_refunds,


            SUM(

                CASE

                    WHEN refund_status = 'PROCESSING'

                    THEN 1

                    ELSE 0

                END

            ) AS processing_refunds,


            SUM(

                CASE

                    WHEN refund_status = 'FAILED'

                    THEN 1

                    ELSE 0

                END

            ) AS failed_refunds


        FROM transaction_refunds


        WHERE merchant_id = ?

    `,



    // ==================================================
    // Refund Trend
    // ==================================================

    GET_REFUND_TREND: `

        SELECT


            DATE_FORMAT(created_at,'%Y-%m') AS month,


            COUNT(*) AS total_refunds,


            COALESCE(

                SUM(amount),

                0

            ) AS refund_amount


        FROM transaction_refunds


        WHERE merchant_id = ?


        GROUP BY DATE_FORMAT(created_at,'%Y-%m')


        ORDER BY month ASC

    `,



    // ==================================================
    // Refund Status Distribution
    // ==================================================

    GET_REFUND_STATUS_DISTRIBUTION: `

        SELECT


            refund_status,


            COUNT(*) AS total_refunds,


            COALESCE(

                SUM(amount),

                0

            ) AS total_amount


        FROM transaction_refunds


        WHERE merchant_id = ?


        GROUP BY refund_status

    `



};


module.exports = REFUND_DASHBOARD_QUERIES;