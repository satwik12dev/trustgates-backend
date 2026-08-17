const REPORTS_QUERIES = Object.freeze({

    // ==========================================================
    // DAILY REPORT SUMMARY
    // ==========================================================

    GET_DAILY_SUMMARY: `

        SELECT

            /* ==================================================
               TOTAL
            ================================================== */

            COUNT(*) AS total_transactions,


            /* ==================================================
               SUCCESS
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'SUCCESS'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS successful_amount,


            /* ==================================================
               FAILED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'FAILED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS failed_amount,


            /* ==================================================
               PENDING
               ONLY status = PENDING
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'PENDING'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS pending_amount,


            /* ==================================================
               CREATED
               ONLY status = CREATED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS created_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'CREATED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS created_amount,


            /* ==================================================
               AUTHORIZED
               ONLY status = AUTHORIZED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'AUTHORIZED'
                    THEN 1
                    ELSE 0
                END
            ) AS authorized_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'AUTHORIZED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS authorized_amount,


            /* ==================================================
               CANCELLED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'CANCELLED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS cancelled_amount,


            /* ==================================================
               REFUNDED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'REFUNDED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS refunded_amount,


            /* ==================================================
               PARTIALLY REFUNDED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS partially_refunded_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'PARTIALLY_REFUNDED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS partially_refunded_amount,


            /* ==================================================
               CHARGEBACK
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargeback_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'CHARGEBACK'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS chargeback_amount,


            /* ==================================================
               TOTAL AMOUNT
            ================================================== */

            COALESCE(
                SUM(amount),
                0
            ) AS total_amount


        FROM transactions


        WHERE merchant_id = ?

          AND payment_type = 'PAYIN'

          AND created_at >= ?

          AND created_at < ?

    `,


    // ==========================================================
    // DAILY TRANSACTIONS
    // ==========================================================

    GET_DAILY_TRANSACTIONS: `

        SELECT

            transaction_id,

            transaction_ref,

            order_id,

            gateway_order_id,

            gateway_payment_id,

            gateway_reference,

            customer_name,

            customer_email,

            customer_phone,

            amount,

            currency,

            payment_method,

            gateway_name,

            payment_type,

            status,

            completion_source,

            settlement_status,

            settled_at,

            failure_code,

            failure_message,

            attempt_count,

            created_at,

            completed_at,

            updated_at

        FROM transactions

        WHERE merchant_id = ?

          AND payment_type = 'PAYIN'

          AND created_at >= ?

          AND created_at < ?

        ORDER BY created_at DESC

    `,


    // ==========================================================
    // MONTHLY REPORT SUMMARY
    // ==========================================================

    GET_MONTHLY_SUMMARY: `

        SELECT

            /* ==================================================
               TOTAL
            ================================================== */

            COUNT(*) AS total_transactions,


            /* ==================================================
               SUCCESS
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'SUCCESS'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS successful_amount,


            /* ==================================================
               FAILED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'FAILED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS failed_amount,


            /* ==================================================
               PENDING
               ONLY status = PENDING
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'PENDING'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS pending_amount,


            /* ==================================================
               CREATED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS created_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'CREATED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS created_amount,


            /* ==================================================
               AUTHORIZED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'AUTHORIZED'
                    THEN 1
                    ELSE 0
                END
            ) AS authorized_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'AUTHORIZED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS authorized_amount,


            /* ==================================================
               CANCELLED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'CANCELLED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS cancelled_amount,


            /* ==================================================
               REFUNDED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'REFUNDED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS refunded_amount,


            /* ==================================================
               PARTIALLY REFUNDED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS partially_refunded_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'PARTIALLY_REFUNDED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS partially_refunded_amount,


            /* ==================================================
               CHARGEBACK
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargeback_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'CHARGEBACK'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS chargeback_amount,


            /* ==================================================
               TOTAL AMOUNT
            ================================================== */

            COALESCE(
                SUM(amount),
                0
            ) AS total_amount


        FROM transactions

        WHERE merchant_id = ?

          AND payment_type = 'PAYIN'

          AND created_at >= ?

          AND created_at < ?

    `,


    // ==========================================================
    // MONTHLY DAILY BREAKDOWN
    // ==========================================================

    GET_MONTHLY_DAILY_BREAKDOWN: `

        SELECT

            DATE(created_at) AS report_date,


            /* ==================================================
               TOTAL
            ================================================== */

            COUNT(*) AS total_transactions,


            /* ==================================================
               SUCCESS
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'SUCCESS'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS successful_amount,


            /* ==================================================
               FAILED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'FAILED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS failed_amount,


            /* ==================================================
               PENDING
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'PENDING'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS pending_amount,


            /* ==================================================
               CREATED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS created_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'CREATED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS created_amount,


            /* ==================================================
               AUTHORIZED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'AUTHORIZED'
                    THEN 1
                    ELSE 0
                END
            ) AS authorized_transactions,


            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'AUTHORIZED'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS authorized_amount,


            /* ==================================================
               CANCELLED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,


            /* ==================================================
               REFUNDED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded_transactions,


            /* ==================================================
               PARTIALLY REFUNDED
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS partially_refunded_transactions,


            /* ==================================================
               CHARGEBACK
            ================================================== */

            SUM(
                CASE
                    WHEN status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargeback_transactions,


            /* ==================================================
               TOTAL
            ================================================== */

            COALESCE(
                SUM(amount),
                0
            ) AS total_amount


        FROM transactions

        WHERE merchant_id = ?

          AND payment_type = 'PAYIN'

          AND created_at >= ?

          AND created_at < ?

        GROUP BY DATE(created_at)

        ORDER BY report_date ASC

    `,


    // ==========================================================
    // MONTHLY TRANSACTIONS
    // ==========================================================

    GET_MONTHLY_TRANSACTIONS: `

        SELECT

            transaction_id,

            transaction_ref,

            order_id,

            gateway_order_id,

            gateway_payment_id,

            gateway_reference,

            customer_name,

            customer_email,

            customer_phone,

            amount,

            currency,

            payment_method,

            gateway_name,

            payment_type,

            status,

            completion_source,

            settlement_status,

            settled_at,

            failure_code,

            failure_message,

            attempt_count,

            created_at,

            completed_at,

            updated_at

        FROM transactions

        WHERE merchant_id = ?

          AND payment_type = 'PAYIN'

          AND created_at >= ?

          AND created_at < ?

        ORDER BY created_at DESC

    `

});


module.exports = REPORTS_QUERIES;