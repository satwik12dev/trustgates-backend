const PAYLATER_QUERIES = Object.freeze({

    // ==========================================================
    // PAY LATER DASHBOARD
    // GET /paylater
    // ==========================================================

    GET_PAYLATER_TRANSACTIONS: `

        SELECT

            p.transaction_paylater_id,
            p.transaction_id,

            p.provider_name,
            p.loan_reference,
            p.due_date,

            p.gateway_reference AS paylater_gateway_reference,

            p.created_at AS paylater_created_at,
            p.updated_at AS paylater_updated_at,

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

        FROM transaction_paylater p

        INNER JOIN transactions t
            ON t.transaction_id = p.transaction_id

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

                OR p.provider_name LIKE ?

                OR p.loan_reference LIKE ?

                OR p.gateway_reference LIKE ?

                OR t.transaction_ref LIKE ?

                OR t.order_id LIKE ?

                OR t.gateway_payment_id LIKE ?

                OR t.customer_name LIKE ?

                OR t.customer_email LIKE ?

                OR t.customer_phone LIKE ?
            )

        ORDER BY
            t.created_at DESC

    `,


    // ==========================================================
    // PAY LATER SUMMARY
    // GET /paylater/summary
    // ==========================================================

    GET_PAYLATER_SUMMARY: `

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
                SUM(t.amount) -
                SUM(
                    CASE
                        WHEN t.status = 'SUCCESS'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS remaining_amount,

            COALESCE(
                AVG(t.amount),
                0
            ) AS average_transaction_value,

            COUNT(
                CASE
                    WHEN p.due_date IS NOT NULL
                    THEN 1
                END
            ) AS transactions_with_due_date

        FROM transaction_paylater p

        INNER JOIN transactions t
            ON t.transaction_id = p.transaction_id

        WHERE

            (
                ? IS NULL
                OR t.merchant_id = ?
            )

            AND t.created_at >= ?

            AND t.created_at < ?

    `,


    // ==========================================================
    // RECENT PAY LATER TRANSACTIONS
    // GET /paylater/recent
    // ==========================================================

    GET_RECENT_PAYLATER_TRANSACTIONS: `

        SELECT

            p.transaction_paylater_id,
            p.transaction_id,

            p.provider_name,
            p.loan_reference,
            p.due_date,

            p.gateway_reference AS paylater_gateway_reference,

            t.transaction_ref,

            t.merchant_id,
            m.business_name,

            t.order_id,

            t.customer_name,
            t.customer_email,
            t.customer_phone,

            t.amount,
            t.currency,

            t.payment_method,
            t.payment_type,

            t.status,

            t.created_at,
            t.completed_at

        FROM transaction_paylater p

        INNER JOIN transactions t
            ON t.transaction_id = p.transaction_id

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
    // PROVIDER ANALYTICS
    // GET /paylater/providers
    // ==========================================================

    GET_PAYLATER_PROVIDER_ANALYTICS: `

        SELECT

            COALESCE(
                p.provider_name,
                'UNKNOWN'
            ) AS provider_name,

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

        FROM transaction_paylater p

        INNER JOIN transactions t
            ON t.transaction_id = p.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY

            COALESCE(
                p.provider_name,
                'UNKNOWN'
            )

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // DUE DATE ANALYTICS
    // GET /paylater/due-dates
    // ==========================================================

    GET_PAYLATER_DUE_DATE_ANALYTICS: `

        SELECT

            DATE(p.due_date) AS due_date,

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
            ) AS successful_amount,

            SUM(
                CASE
                    WHEN p.due_date < NOW()
                    THEN 1
                    ELSE 0
                END
            ) AS overdue_transactions,

            SUM(
                CASE
                    WHEN p.due_date >= NOW()
                    THEN 1
                    ELSE 0
                END
            ) AS upcoming_transactions

        FROM transaction_paylater p

        INNER JOIN transactions t
            ON t.transaction_id = p.transaction_id

        WHERE

            p.due_date IS NOT NULL

            AND p.due_date >= ?

            AND p.due_date < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY
            DATE(p.due_date)

        ORDER BY
            due_date ASC

    `,


    // ==========================================================
    // MERCHANT PAY LATER ANALYTICS
    // GET /paylater/merchant
    // ==========================================================

    GET_MERCHANT_PAYLATER_ANALYTICS: `

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

            COUNT(
                CASE
                    WHEN p.due_date IS NOT NULL
                    THEN 1
                END
            ) AS transactions_with_due_date

        FROM transaction_paylater p

        INNER JOIN transactions t
            ON t.transaction_id = p.transaction_id

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
    // DAILY PAY LATER ANALYTICS
    // GET /paylater/daily
    // ==========================================================

    GET_DAILY_PAYLATER_ANALYTICS: `

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

        FROM transaction_paylater p

        INNER JOIN transactions t
            ON t.transaction_id = p.transaction_id

        WHERE

            t.created_at >= ?

            AND t.created_at < ?

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        GROUP BY
            DATE(t.created_at)

        ORDER BY
            report_date ASC

    `,


    // ==========================================================
    // UPCOMING DUE PAYMENTS
    // GET /paylater/upcoming-due
    // ==========================================================

    GET_UPCOMING_PAYLATER_DUE: `

        SELECT

            p.transaction_paylater_id,

            p.transaction_id,

            p.provider_name,

            p.loan_reference,

            p.due_date,

            p.gateway_reference
                AS paylater_gateway_reference,

            t.transaction_ref,

            t.merchant_id,

            m.business_name,

            t.order_id,

            t.customer_name,

            t.customer_email,

            t.customer_phone,

            t.amount,

            t.currency,

            t.payment_method,

            t.payment_type,

            t.status,

            DATEDIFF(
                DATE(p.due_date),
                CURDATE()
            ) AS days_until_due,

            t.created_at,
            t.completed_at

        FROM transaction_paylater p

        INNER JOIN transactions t
            ON t.transaction_id = p.transaction_id

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE

            p.due_date IS NOT NULL

            AND p.due_date >= NOW()

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

            AND t.status NOT IN (
                'REFUNDED',
                'CANCELLED',
                'FAILED'
            )

        ORDER BY
            p.due_date ASC

        LIMIT ?

    `

});


module.exports = PAYLATER_QUERIES;
