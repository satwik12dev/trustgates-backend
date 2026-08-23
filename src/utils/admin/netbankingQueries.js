const NETBANKING_QUERIES = Object.freeze({

    // ==========================================================
    // NET BANKING TRANSACTIONS
    // ==========================================================

    GET_NETBANKING_TRANSACTIONS: `

        SELECT

            nb.transaction_netbanking_id,
            nb.transaction_id,

            nb.bank_code,
            nb.bank_name,
            nb.bank_transaction_id,
            nb.gateway_reference AS netbanking_gateway_reference,

            nb.created_at AS netbanking_created_at,
            nb.updated_at AS netbanking_updated_at,

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

        FROM transaction_netbanking nb

        INNER JOIN transactions t
            ON t.transaction_id = nb.transaction_id

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
                OR t.created_at >= ?
            )

            AND (
                ? IS NULL
                OR t.created_at < ?
            )

            AND (
                ? IS NULL

                OR nb.bank_code LIKE ?

                OR nb.bank_name LIKE ?

                OR nb.bank_transaction_id LIKE ?

                OR nb.gateway_reference LIKE ?

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
    // NET BANKING SUMMARY
    // ==========================================================

    GET_NETBANKING_SUMMARY: `

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
            ) AS successful_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN t.status = 'REFUNDED'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS refunded_amount,

            COALESCE(
                AVG(
                    CASE
                        WHEN t.status = 'SUCCESS'
                        THEN t.amount
                        ELSE NULL
                    END
                ),
                0
            ) AS average_transaction_value

        FROM transaction_netbanking nb

        INNER JOIN transactions t
            ON t.transaction_id = nb.transaction_id

        WHERE

            (
                ? IS NULL
                OR t.merchant_id = ?
            )

            AND t.created_at >= ?

            AND t.created_at < ?

    `,


    // ==========================================================
    // RECENT NET BANKING TRANSACTIONS
    // ==========================================================

    GET_RECENT_NETBANKING_TRANSACTIONS: `

        SELECT

            nb.transaction_netbanking_id,
            nb.transaction_id,

            nb.bank_code,
            nb.bank_name,
            nb.bank_transaction_id,
            nb.gateway_reference AS netbanking_gateway_reference,

            t.transaction_ref,

            t.merchant_id,
            m.business_name,

            t.order_id,

            t.customer_name,
            t.customer_email,

            t.amount,
            t.currency,

            t.payment_method,
            t.payment_type,

            t.status,

            t.created_at,
            t.completed_at

        FROM transaction_netbanking nb

        INNER JOIN transactions t
            ON t.transaction_id = nb.transaction_id

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
    // BANK ANALYTICS
    // ==========================================================

    GET_NETBANK_BANK_ANALYTICS: `

        SELECT

            COALESCE(
                nb.bank_name,
                'UNKNOWN'
            ) AS bank_name,

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

            COALESCE(
                SUM(
                    CASE
                        WHEN t.status = 'REFUNDED'
                        THEN 1
                        ELSE 0
                    END
                ),
                0
            ) AS refunded_transactions,

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
                SUM(
                    CASE
                        WHEN t.status = 'REFUNDED'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS refunded_amount

        FROM transaction_netbanking nb

        INNER JOIN transactions t
            ON t.transaction_id = nb.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY
            COALESCE(
                nb.bank_name,
                'UNKNOWN'
            )

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // ACCOUNT TYPE ANALYTICS
    // ==========================================================
    // NOTE:
    // transaction_netbanking does not have an account_type
    // column. We cannot calculate this accurately from the
    // current schema.
    // ==========================================================

    GET_NETBANK_ACCOUNT_TYPE_ANALYTICS: `

        SELECT

            'UNKNOWN' AS account_type,

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

        FROM transaction_netbanking nb

        INNER JOIN transactions t
            ON t.transaction_id = nb.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

    `,


    // ==========================================================
    // STATUS ANALYTICS
    // ==========================================================

    GET_NETBANK_STATUS_ANALYTICS: `

        SELECT

            t.status AS transaction_status,

            COUNT(*) AS total_transactions,

            COALESCE(
                SUM(t.amount),
                0
            ) AS total_amount

        FROM transaction_netbanking nb

        INNER JOIN transactions t
            ON t.transaction_id = nb.transaction_id

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
    // MERCHANT NET BANKING ANALYTICS
    // ==========================================================

    GET_MERCHANT_NETBANKING_ANALYTICS: `

        SELECT

            t.merchant_id,

            m.business_name,

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
            ) AS revenue

        FROM transaction_netbanking nb

        INNER JOIN transactions t
            ON t.transaction_id = nb.transaction_id

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY

            t.merchant_id,
            m.business_name

        ORDER BY
            revenue DESC

    `,


    // ==========================================================
    // BANK CODE ANALYTICS
    // ==========================================================

    GET_NETBANK_BANK_CODE_ANALYTICS: `

        SELECT

            COALESCE(
                nb.bank_code,
                'UNKNOWN'
            ) AS bank_code,

            COALESCE(
                nb.bank_name,
                'UNKNOWN'
            ) AS bank_name,

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

            COALESCE(
                SUM(
                    CASE
                        WHEN t.status = 'REFUNDED'
                        THEN 1
                        ELSE 0
                    END
                ),
                0
            ) AS refunded_transactions,

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
                SUM(
                    CASE
                        WHEN t.status = 'REFUNDED'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS refunded_amount

        FROM transaction_netbanking nb

        INNER JOIN transactions t
            ON t.transaction_id = nb.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY

            nb.bank_code,
            nb.bank_name

        ORDER BY
            total_transactions DESC

    `

});


module.exports = NETBANKING_QUERIES;
