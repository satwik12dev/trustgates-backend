const WALLET_DASHBOARD_QUERIES = {


    // ==================================================
    // Wallet Overview
    // ==================================================

    GET_WALLET_OVERVIEW: `

    SELECT

        wallet_id,

        merchant_id,

        available_balance,

        pending_balance,

        blocked_balance,

        total_received,

        total_refunded,

        total_settled,

        currency,

        wallet_status,

        last_transaction_at


    FROM merchant_wallets


    WHERE merchant_id = ?


    LIMIT 1

`,



    // ==================================================
    // Wallet Transaction Summary
    // ==================================================

    GET_WALLET_TRANSACTION_SUMMARY: `

        SELECT


            COUNT(*) AS total_transactions,


            COALESCE(

                SUM(

                    CASE

                        WHEN transaction_type = 'CREDIT'

                        THEN amount

                        ELSE 0

                    END

                ),

                0

            ) AS total_credit,



            COALESCE(

                SUM(

                    CASE

                        WHEN transaction_type = 'DEBIT'

                        THEN amount

                        ELSE 0

                    END

                ),

                0

            ) AS total_debit



        FROM wallet_transactions


        WHERE merchant_id = ?

    `



};



module.exports = WALLET_DASHBOARD_QUERIES;