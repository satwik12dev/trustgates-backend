const WALLET_QUERIES = Object.freeze({

    // ==========================================================
    // WALLET TRANSACTIONS
    // ==========================================================

    GET_WALLET_TRANSACTIONS: `

        SELECT

            tw.transaction_wallet_id,
            tw.transaction_id,

            tw.wallet_name,
            tw.wallet_transaction_id,
            tw.gateway_reference,

            tw.created_at AS wallet_created_at,
            tw.updated_at AS wallet_updated_at,

            t.transaction_ref,

            t.merchant_id,
            m.business_name,

            t.order_id,

            t.gateway_order_id,
            t.gateway_payment_id,
            t.gateway_reference,

            t.customer_name,
            t.customer_email,
            t.customer_phone,

            t.amount,
            t.currency,

            t.payment_method,
            t.payment_type,

            t.status,

            t.merchant_fee,
            t.gateway_fee,
            t.gateway_tax,
            t.net_amount,

            t.settlement_status,
            t.settled_at,

            t.failure_code,
            t.failure_message,

            t.attempt_count,

            t.created_at,
            t.completed_at,
            t.updated_at

        FROM transaction_wallet tw

        INNER JOIN transactions t
            ON t.transaction_id = tw.transaction_id

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE

            (
                ? IS NULL
                OR t.merchant_id = ?
            )

            AND (
                ? IS NULL
                OR t.status = ?
            )

            AND (
                ? IS NULL
                OR tw.wallet_name = ?
            )

            AND (
                ? IS NULL
                OR t.created_at >= ?
            )

            AND (
                ? IS NULL
                OR t.created_at < ?
            )

            AND (
                ? IS NULL

                OR tw.wallet_transaction_id LIKE ?

                OR tw.gateway_reference LIKE ?

                OR t.transaction_ref LIKE ?

                OR t.order_id LIKE ?

                OR t.gateway_payment_id LIKE ?

                OR t.customer_name LIKE ?

                OR t.customer_email LIKE ?
            )

        ORDER BY
            t.created_at DESC

    `,


    // ==========================================================
    // WALLET SUMMARY
    // ==========================================================

    GET_WALLET_SUMMARY: `

        SELECT

            COUNT(*) AS total_transactions,

            SUM(
                CASE
                    WHEN t.status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,

            SUM(
                CASE
                    WHEN t.status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,

            SUM(
                CASE
                    WHEN t.status IN (
                        'PENDING',
                        'CREATED',
                        'AUTHORIZED'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,

            SUM(
                CASE
                    WHEN t.status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,

            SUM(
                CASE
                    WHEN t.status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded_transactions,

            SUM(
                CASE
                    WHEN t.status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS partially_refunded_transactions,

            SUM(
                CASE
                    WHEN t.status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargeback_transactions,

            COALESCE(
                SUM(t.amount),
                0
            ) AS total_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN t.status = 'SUCCESS'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS successful_amount

        FROM transaction_wallet tw

        INNER JOIN transactions t
            ON t.transaction_id = tw.transaction_id

        WHERE

            (
                ? IS NULL
                OR t.merchant_id = ?
            )

            AND t.created_at >= ?

            AND t.created_at < ?

    `,


    // ==========================================================
    // RECENT WALLET TRANSACTIONS
    // ==========================================================

    GET_RECENT_WALLET_TRANSACTIONS: `

        SELECT

            tw.transaction_wallet_id,
            tw.transaction_id,

            tw.wallet_name,
            tw.wallet_transaction_id,
            tw.gateway_reference,

            t.transaction_ref,

            t.merchant_id,
            m.business_name,

            t.order_id,

            t.gateway_order_id,
            t.gateway_payment_id,

            t.customer_name,
            t.customer_email,
            t.customer_phone,

            t.amount,
            t.currency,

            t.payment_method,
            t.payment_type,

            t.status,

            t.merchant_fee,
            t.gateway_fee,
            t.gateway_tax,
            t.net_amount,

            t.settlement_status,
            t.settled_at,

            t.created_at,
            t.completed_at

        FROM transaction_wallet tw

        INNER JOIN transactions t
            ON t.transaction_id = tw.transaction_id

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE

            (
                ? IS NULL
                OR t.merchant_id = ?
            )

        ORDER BY
            t.created_at DESC

        LIMIT ?

    `,


    // ==========================================================
    // WALLET ANALYTICS
    // ==========================================================

    GET_WALLET_ANALYTICS: `

        SELECT

            DATE(t.created_at) AS report_date,

            COUNT(*) AS total_transactions,

            SUM(
                CASE
                    WHEN t.status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,

            SUM(
                CASE
                    WHEN t.status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,

            SUM(
                CASE
                    WHEN t.status IN (
                        'PENDING',
                        'CREATED',
                        'AUTHORIZED'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,

            SUM(
                CASE
                    WHEN t.status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,

            SUM(
                CASE
                    WHEN t.status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded_transactions,

            SUM(
                CASE
                    WHEN t.status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS partially_refunded_transactions,

            SUM(
                CASE
                    WHEN t.status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargeback_transactions,

            COALESCE(
                SUM(
                    CASE
                        WHEN t.status = 'SUCCESS'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS successful_amount,

            COALESCE(
                SUM(t.amount),
                0
            ) AS total_amount

        FROM transaction_wallet tw

        INNER JOIN transactions t
            ON t.transaction_id = tw.transaction_id

        WHERE

            (
                ? IS NULL
                OR t.merchant_id = ?
            )

            AND t.created_at >= ?

            AND t.created_at < ?

        GROUP BY
            DATE(t.created_at)

        ORDER BY
            report_date ASC

    `,


    // ==========================================================
    // WALLET STATUS ANALYTICS
    // ==========================================================

    GET_WALLET_STATUS_ANALYTICS: `

        SELECT

            t.status,

            COUNT(*) AS total_transactions,

            COALESCE(
                SUM(t.amount),
                0
            ) AS total_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN t.status = 'SUCCESS'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS successful_amount

        FROM transaction_wallet tw

        INNER JOIN transactions t
            ON t.transaction_id = tw.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY
            t.status

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // TOP WALLETS
    // ==========================================================

    GET_TOP_WALLETS: `

        SELECT

            tw.wallet_name,

            COUNT(*) AS total_transactions,

            SUM(
                CASE
                    WHEN t.status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,

            SUM(
                CASE
                    WHEN t.status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,

            SUM(
                CASE
                    WHEN t.status IN (
                        'PENDING',
                        'CREATED',
                        'AUTHORIZED'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,

            SUM(
                CASE
                    WHEN t.status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,

            SUM(
                CASE
                    WHEN t.status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded_transactions,

            SUM(
                CASE
                    WHEN t.status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS partially_refunded_transactions,

            SUM(
                CASE
                    WHEN t.status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargeback_transactions,

            COALESCE(
                SUM(
                    CASE
                        WHEN t.status = 'SUCCESS'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS revenue,

            COALESCE(
                SUM(t.amount),
                0
            ) AS total_amount

        FROM transaction_wallet tw

        INNER JOIN transactions t
            ON t.transaction_id = tw.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY
            tw.wallet_name

        ORDER BY
            revenue DESC

    `

});


// ==========================================================
// EXPORT
// ==========================================================

module.exports = WALLET_QUERIES;