const CARD_QUERIES = Object.freeze({

    // ==========================================================
    // CARD TRANSACTIONS
    // ==========================================================

    GET_CARD_TRANSACTIONS: `

        SELECT

            tc.transaction_card_id,
            tc.transaction_id,

            tc.card_network,
            tc.card_type,
            tc.last_four,
            tc.issuer,
            tc.bank_name,
            tc.auth_code,
            tc.gateway_reference,

            tc.created_at AS card_created_at,
            tc.updated_at AS card_updated_at,

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

        FROM transaction_card tc

        INNER JOIN transactions t
            ON t.transaction_id = tc.transaction_id

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

                OR tc.card_network LIKE ?

                OR tc.card_type LIKE ?

                OR tc.last_four LIKE ?

                OR tc.issuer LIKE ?

                OR tc.bank_name LIKE ?

                OR tc.auth_code LIKE ?

                OR tc.gateway_reference LIKE ?

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
    // CARD SUMMARY
    // ==========================================================

    GET_CARD_SUMMARY: `

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
                AVG(
                    CASE
                        WHEN t.status = 'SUCCESS'
                        THEN t.amount
                        ELSE NULL
                    END
                ),
                0
            ) AS average_transaction_value

        FROM transaction_card tc

        INNER JOIN transactions t
            ON t.transaction_id = tc.transaction_id

        WHERE

            (
                ? IS NULL
                OR t.merchant_id = ?
            )

            AND t.created_at >= ?

            AND t.created_at < ?

    `,


    // ==========================================================
    // RECENT CARD TRANSACTIONS
    // ==========================================================

    GET_RECENT_CARD_TRANSACTIONS: `

        SELECT

            tc.transaction_card_id,
            tc.transaction_id,

            tc.card_network,
            tc.card_type,
            tc.last_four,
            tc.issuer,
            tc.bank_name,
            tc.auth_code,
            tc.gateway_reference,

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

        FROM transaction_card tc

        INNER JOIN transactions t
            ON t.transaction_id = tc.transaction_id

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
    // CARD NETWORK ANALYTICS
    // ==========================================================

    GET_CARD_NETWORK_ANALYTICS: `

        SELECT

            COALESCE(
                tc.card_network,
                'UNKNOWN'
            ) AS card_network,

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

        FROM transaction_card tc

        INNER JOIN transactions t
            ON t.transaction_id = tc.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY
            COALESCE(
                tc.card_network,
                'UNKNOWN'
            )

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // CARD TYPE ANALYTICS
    // ==========================================================

    GET_CARD_TYPE_ANALYTICS: `

        SELECT

            COALESCE(
                tc.card_type,
                'UNKNOWN'
            ) AS card_type,

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

        FROM transaction_card tc

        INNER JOIN transactions t
            ON t.transaction_id = tc.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY
            COALESCE(
                tc.card_type,
                'UNKNOWN'
            )

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // ISSUING BANK ANALYTICS
    // ==========================================================

    GET_ISSUING_BANK_ANALYTICS: `

        SELECT

            COALESCE(
                tc.bank_name,
                tc.issuer,
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
                        WHEN t.status = 'SUCCESS'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS successful_amount

        FROM transaction_card tc

        INNER JOIN transactions t
            ON t.transaction_id = tc.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY

            COALESCE(
                tc.bank_name,
                tc.issuer,
                'UNKNOWN'
            )

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // MERCHANT CARD ANALYTICS
    // ==========================================================

    GET_MERCHANT_CARD_ANALYTICS: `

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

        FROM transaction_card tc

        INNER JOIN transactions t
            ON t.transaction_id = tc.transaction_id

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
    // CARD COUNTRY ANALYTICS
    // ==========================================================
    // NOTE:
    // Current transaction_card schema has no country column.
    // This query intentionally does not guess a country field.
    // Country analytics should be added once a country source
    // column is available.
    // ==========================================================

    GET_CARD_COUNTRY_ANALYTICS: `

    SELECT

        COALESCE(
            tc.country,
            'UNKNOWN'
        ) AS country,

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
                WHEN t.status = 'PENDING'
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

    FROM transaction_card tc

    INNER JOIN transactions t
        ON t.transaction_id = tc.transaction_id

    WHERE

        t.created_at >= ?

        AND t.created_at < ?

        AND (
            ? IS NULL
            OR t.merchant_id = ?
        )

    GROUP BY
        COALESCE(
            tc.country,
            'UNKNOWN'
        )

    ORDER BY
        total_transactions DESC

`,

});


module.exports = CARD_QUERIES;