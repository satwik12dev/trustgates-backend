const UPI_QUERIES = Object.freeze({

    // ==========================================================
    // UPI TRANSACTIONS
    // ==========================================================

    GET_UPI_TRANSACTIONS: `

        SELECT

            tu.transaction_upi_id,
            tu.transaction_id,

            tu.vpa,
            tu.payer_name,
            tu.payer_account_type,

            tu.rrn,
            tu.npci_transaction_id,
            tu.bank_reference,
            tu.bank_name,

            tu.gateway_response_code,
            tu.gateway_response_message,

            tu.created_at AS upi_created_at,
            tu.updated_at AS upi_updated_at,

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

        FROM transaction_upi tu

        INNER JOIN transactions t
            ON t.transaction_id = tu.transaction_id

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

                OR tu.vpa LIKE ?

                OR tu.payer_name LIKE ?

                OR tu.rrn LIKE ?

                OR tu.npci_transaction_id LIKE ?

                OR tu.bank_reference LIKE ?

                OR tu.bank_name LIKE ?

                OR tu.gateway_response_code LIKE ?

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
    // UPI SUMMARY
    // ==========================================================

    GET_UPI_SUMMARY: `

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

        FROM transaction_upi tu

        INNER JOIN transactions t
            ON t.transaction_id = tu.transaction_id

        WHERE

            (
                ? IS NULL
                OR t.merchant_id = ?
            )

            AND t.created_at >= ?

            AND t.created_at < ?

    `,


    // ==========================================================
    // RECENT UPI TRANSACTIONS
    // ==========================================================

    GET_RECENT_UPI_TRANSACTIONS: `

        SELECT

            tu.transaction_upi_id,
            tu.transaction_id,

            tu.vpa,
            tu.payer_name,
            tu.payer_account_type,

            tu.rrn,
            tu.npci_transaction_id,
            tu.bank_reference,
            tu.bank_name,

            tu.gateway_response_code,
            tu.gateway_response_message,

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

        FROM transaction_upi tu

        INNER JOIN transactions t
            ON t.transaction_id = tu.transaction_id

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
    // UPI ANALYTICS
    // ==========================================================

    GET_UPI_ANALYTICS: `

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
                    WHEN t.status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
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
                SUM(t.amount),
                0
            ) AS total_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN t.status = 'SUCCESS'
                        THEN (
                            SELECT COALESCE(
                                SUM(r.amount),
                                0
                            )
                            FROM transaction_refunds r
                            WHERE
                                r.transaction_id = t.transaction_id
                                AND r.refund_status = 'PROCESSED'
                        )
                        ELSE 0
                    END
                ),
                0
            ) AS refunded_amount,

            (
                COALESCE(
                    SUM(
                        CASE
                            WHEN t.status = 'SUCCESS'
                            THEN t.amount
                            ELSE 0
                        END
                    ),
                    0
                )
                -
                COALESCE(
                    SUM(
                        CASE
                            WHEN t.status = 'SUCCESS'
                            THEN (
                                SELECT COALESCE(
                                    SUM(r.amount),
                                    0
                                )
                                FROM transaction_refunds r
                                WHERE
                                    r.transaction_id = t.transaction_id
                                    AND r.refund_status = 'PROCESSED'
                            )
                            ELSE 0
                        END
                    ),
                    0
                )
            ) AS net_revenue

        FROM transactions t

        INNER JOIN transaction_upi tu
            ON tu.transaction_id = t.transaction_id

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
    // BANK ANALYTICS
    // ==========================================================

    GET_UPI_BANK_ANALYTICS: `

        SELECT

            COALESCE(
                tu.bank_name,
                'UNKNOWN'
            ) AS bank,

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

        FROM transaction_upi tu

        INNER JOIN transactions t
            ON t.transaction_id = tu.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY
            COALESCE(
                tu.bank_name,
                'UNKNOWN'
            )

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // MERCHANT UPI ANALYTICS
    // ==========================================================

    GET_MERCHANT_UPI_ANALYTICS: `

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

        FROM transaction_upi tu

        INNER JOIN transactions t
            ON t.transaction_id = tu.transaction_id

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
    // UPI VERIFICATION ANALYTICS
    // ==========================================================

    GET_UPI_VERIFICATION_ANALYTICS: `

        SELECT

            COALESCE(
                tu.gateway_response_code,
                'UNKNOWN'
            ) AS response_code,

            COALESCE(
                tu.gateway_response_message,
                'UNKNOWN'
            ) AS response_message,

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

        FROM transaction_upi tu

        INNER JOIN transactions t
            ON t.transaction_id = tu.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY

            COALESCE(
                tu.gateway_response_code,
                'UNKNOWN'
            ),

            COALESCE(
                tu.gateway_response_message,
                'UNKNOWN'
            )

        ORDER BY
            total_transactions DESC

    `

});


// ==========================================================
// EXPORT
// ==========================================================

module.exports = UPI_QUERIES;