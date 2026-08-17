const DASHBOARD_SUMMARY_QUERIES = {

    GET_TRANSACTION_SUMMARY: `

        SELECT

            COUNT(*) AS total_transactions,

            /* =========================
               PAYIN
            ========================= */

            COALESCE(
                SUM(
                    CASE
                        WHEN payment_type = 'PAYIN'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_payin,


            /* =========================
               PAYOUT
            ========================= */

            COALESCE(
                (
                    SELECT SUM(tr.amount)
                    FROM transaction_refunds tr
                    WHERE tr.merchant_id = ?
                ),
                0
            ) AS total_payout,


            /* =========================
               SUCCESS
            ========================= */

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,


            /* =========================
               FAILED
            ========================= */

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,


            /* =========================
               PENDING
            ========================= */

            SUM(
                CASE
                    WHEN status IN ('CREATED', 'PENDING')
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,


            /* =========================
               AUTHORIZED
            ========================= */

            SUM(
                CASE
                    WHEN status = 'AUTHORIZED'
                    THEN 1
                    ELSE 0
                END
            ) AS authorized_transactions,


            /* =========================
               CANCELLED
            ========================= */

            SUM(
                CASE
                    WHEN status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,


            /* =========================
               REFUND COUNT
            ========================= */

            (
                SELECT COUNT(*)
                FROM transaction_refunds tr
                WHERE tr.merchant_id = ?
            ) AS refund_count,


            /* =========================
               CHARGEBACK
            ========================= */

            SUM(
                CASE
                    WHEN status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargebacks,


            /* =========================
               SUCCESS RATE
            ========================= */

            COALESCE(
                (
                    SUM(
                        CASE
                            WHEN status = 'SUCCESS'
                            THEN 1
                            ELSE 0
                        END
                    )
                    /
                    NULLIF(COUNT(*), 0)
                ) * 100,
                0
            ) AS success_rate,


            /* =========================
               AVG TRANSACTION
            ========================= */

            COALESCE(
                AVG(
                    CASE
                        WHEN status = 'SUCCESS'
                        THEN amount
                    END
                ),
                0
            ) AS avg_transaction,


            /* =========================
               REFUNDED AMOUNT
            ========================= */

            COALESCE(
                (
                    SELECT SUM(tr.amount)
                    FROM transaction_refunds tr
                    WHERE tr.merchant_id = ?
                      AND tr.refund_status = 'PROCESSED'
                ),
                0
            ) AS refunded_amount

        FROM transactions

        WHERE merchant_id = ?

    `,


    /* =========================
       WALLET
    ========================= */

    GET_WALLET_SUMMARY: `

        SELECT

            available_balance,
            total_settled,
            total_refunded,
            pending_balance

        FROM merchant_wallets

        WHERE merchant_id = ?

        LIMIT 1

    `

};


module.exports = DASHBOARD_SUMMARY_QUERIES;