const WALLET_ANALYTICS_QUERIES = {


    // ==================================================
    // Wallet Summary Analytics
    // ==================================================

    GET_WALLET_SUMMARY: `

        SELECT


            SUM(

                CASE

                    WHEN transaction_type = 'CREDIT'

                    THEN amount

                    ELSE 0

                END

            ) AS total_credit,



            SUM(

                CASE

                    WHEN transaction_type = 'DEBIT'

                    THEN amount

                    ELSE 0

                END

            ) AS total_debit,



            COUNT(*) AS total_transactions



        FROM wallet_transactions


        WHERE merchant_id = ?

    `,




    // ==================================================
    // Source Wise Analytics
    // ==================================================

    GET_SOURCE_ANALYTICS: `

        SELECT


            source,


            transaction_type,


            COUNT(*) AS total_count,


            SUM(amount) AS total_amount



        FROM wallet_transactions


        WHERE merchant_id = ?



        GROUP BY

            source,

            transaction_type

    `,




    // ==================================================
    // Monthly Wallet Trend
    // ==================================================

    GET_MONTHLY_TREND: `

        SELECT


            DATE_FORMAT(

                created_at,

                '%Y-%m'

            ) AS month,



            SUM(

                CASE

                    WHEN transaction_type = 'CREDIT'

                    THEN amount

                    ELSE 0

                END

            ) AS credit,



            SUM(

                CASE

                    WHEN transaction_type = 'DEBIT'

                    THEN amount

                    ELSE 0

                END

            ) AS debit



        FROM wallet_transactions



        WHERE merchant_id = ?



        GROUP BY

            DATE_FORMAT(

                created_at,

                '%Y-%m'

            )



        ORDER BY month ASC

    `



};


module.exports = WALLET_ANALYTICS_QUERIES;