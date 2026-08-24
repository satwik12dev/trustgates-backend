const EMI_QUERIES = Object.freeze({

    // ==========================================================
    // EMI TRANSACTIONS
    // ==========================================================

    GET_EMI_TRANSACTIONS: `

        SELECT

            e.transaction_emi_id,
            e.transaction_id,

            e.issuer,
            e.tenure,
            e.interest_rate,
            e.gateway_reference AS emi_gateway_reference,

            e.created_at AS emi_created_at,
            e.updated_at AS emi_updated_at,

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

        FROM transaction_emi e

        INNER JOIN transactions t
            ON t.transaction_id = e.transaction_id

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

                OR e.issuer LIKE ?

                OR e.gateway_reference LIKE ?

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
    // EMI SUMMARY
    // ==========================================================

    GET_EMI_SUMMARY: `

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
            AVG(t.amount),
            0
        ) AS average_transaction_value,

        COALESCE(
            AVG(e.interest_rate),
            0
        ) AS average_interest_rate,

        COALESCE(
            AVG(e.tenure),
            0
        ) AS average_tenure

    FROM transaction_emi e

    INNER JOIN transactions t
        ON t.transaction_id = e.transaction_id

    WHERE

        (
            ? IS NULL
            OR t.merchant_id = ?
        )

        AND t.created_at >= ?

        AND t.created_at < ?

`,


    // ==========================================================
    // RECENT EMI TRANSACTIONS
    // ==========================================================

    GET_RECENT_EMI_TRANSACTIONS: `

        SELECT

            e.transaction_emi_id,
            e.transaction_id,

            e.issuer,
            e.tenure,
            e.interest_rate,

            e.gateway_reference AS emi_gateway_reference,

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

        FROM transaction_emi e

        INNER JOIN transactions t
            ON t.transaction_id = e.transaction_id

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
    // EMI BANK / ISSUER ANALYTICS
    // ==========================================================

    GET_EMI_BANK_ANALYTICS: `

        SELECT

            COALESCE(
                e.issuer,
                'UNKNOWN'
            ) AS issuer,

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

        FROM transaction_emi e

        INNER JOIN transactions t
            ON t.transaction_id = e.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY
            COALESCE(
                e.issuer,
                'UNKNOWN'
            )

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // EMI CARD NETWORK ANALYTICS
    // ==========================================================
    // transaction_emi table has no card_network column.
    // Therefore actual card network cannot be determined
    // from the current schema.
    // ==========================================================

    GET_EMI_CARD_NETWORK_ANALYTICS: `

        SELECT

            'UNKNOWN' AS card_network,

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

        FROM transaction_emi e

        INNER JOIN transactions t
            ON t.transaction_id = e.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

    `,


    // ==========================================================
    // EMI TENURE ANALYTICS
    // ==========================================================

    GET_EMI_TENURE_ANALYTICS: `

        SELECT

            e.tenure,

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
            ) AS successful_amount,

            COALESCE(
                AVG(e.interest_rate),
                0
            ) AS average_interest_rate

        FROM transaction_emi e

        INNER JOIN transactions t
            ON t.transaction_id = e.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY
            e.tenure

        ORDER BY
            e.tenure ASC

    `,


    // ==========================================================
    // MERCHANT EMI ANALYTICS
    // ==========================================================

    GET_MERCHANT_EMI_ANALYTICS: `

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
            ) AS revenue,

            COALESCE(
                AVG(e.tenure),
                0
            ) AS average_tenure,

            COALESCE(
                AVG(e.interest_rate),
                0
            ) AS average_interest_rate

        FROM transaction_emi e

        INNER JOIN transactions t
            ON t.transaction_id = e.transaction_id

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
    // INTEREST RATE ANALYTICS
    // ==========================================================

    GET_EMI_INTEREST_RATE_ANALYTICS: `

        SELECT

            e.interest_rate,

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
            ) AS successful_amount,

            COALESCE(
                AVG(e.tenure),
                0
            ) AS average_tenure

        FROM transaction_emi e

        INNER JOIN transactions t
            ON t.transaction_id = e.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY
            e.interest_rate

        ORDER BY
            e.interest_rate ASC

    `

});


module.exports = EMI_QUERIES;