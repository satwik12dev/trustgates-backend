const DASHBOARD_QUERIES = Object.freeze({

    // ==========================================================
    // DASHBOARD SUMMARY
    // ==========================================================

    GET_DASHBOARD_SUMMARY: `

        SELECT

            COUNT(*) AS total_transactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,

            SUM(
                CASE
                    WHEN status IN (
                        'PENDING'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,

            SUM(
                CASE
                    WHEN status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS created_transactions,

            SUM(
                CASE
                    WHEN status = 'AUTHORIZED'
                    THEN 1
                    ELSE 0
                END
            ) AS authorized_transactions,

            SUM(
                CASE
                    WHEN status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,

            SUM(
                CASE
                    WHEN status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded_transactions,

            SUM(
                CASE
                    WHEN status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS partially_refunded_transactions,

            SUM(
                CASE
                    WHEN status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargeback_transactions

        FROM transactions

        WHERE payment_type = ?

          AND created_at >= ?

          AND created_at < ?

          AND (
                ? IS NULL
                OR merchant_id = ?
          )

    `,


    // ==========================================================
    // REFUND COUNT
    // ==========================================================

    GET_REFUND_COUNT: `

        SELECT

            COUNT(*) AS refund_count

        FROM transaction_refunds

        WHERE created_at >= ?

          AND created_at < ?

          AND (
                ? IS NULL
                OR merchant_id = ?
          )

    `,


    // ==========================================================
    // TODAY'S REVENUE
    // ==========================================================

    GET_TODAYS_REVENUE: `

        SELECT

            COALESCE(
                SUM(amount),
                0
            ) AS todays_revenue

        FROM transactions

        WHERE payment_type = ?

          AND status = 'SUCCESS'

          AND created_at >= ?

          AND created_at < ?

          AND (
                ? IS NULL
                OR merchant_id = ?
          )

    `,


    // ==========================================================
    // MONTHLY REVENUE
    // ==========================================================

    GET_MONTHLY_REVENUE: `

        SELECT

            COALESCE(
                SUM(amount),
                0
            ) AS monthly_revenue

        FROM transactions

        WHERE payment_type = ?

          AND status = 'SUCCESS'

          AND created_at >= ?

          AND created_at < ?

          AND (
                ? IS NULL
                OR merchant_id = ?
          )

    `,


    // ==========================================================
    // AVAILABLE BALANCE
    // ==========================================================

    GET_AVAILABLE_BALANCE: `

        SELECT

            COALESCE(
                SUM(available_balance),
                0
            ) AS available_balance

        FROM merchant_wallets

        WHERE (
            ? IS NULL
            OR merchant_id = ?
        )

    `,


    // ==========================================================
    // SETTLED AMOUNT
    // ==========================================================

    GET_SETTLED_AMOUNT: `

        SELECT

            COALESCE(
                SUM(total_settled),
                0
            ) AS settled_amount

        FROM merchant_wallets

        WHERE (
            ? IS NULL
            OR merchant_id = ?
        )

    `,


    // ==========================================================
    // TOP MERCHANTS
    // ==========================================================

    GET_TOP_MERCHANTS: `

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
                WHEN t.status = 'CREATED'
                THEN 1
                ELSE 0
            END
        ) AS created_transactions,

        SUM(
            CASE
                WHEN t.status = 'PENDING'
                THEN 1
                ELSE 0
            END
        ) AS pending_transactions,

        SUM(
            CASE
                WHEN t.status = 'AUTHORIZED'
                THEN 1
                ELSE 0
            END
        ) AS authorized_transactions,

        SUM(
            CASE
                WHEN t.status = 'FAILED'
                THEN 1
                ELSE 0
            END
        ) AS failed_transactions,

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
        ) AS revenue

    FROM transactions t

    INNER JOIN merchants m
        ON m.merchant_id = t.merchant_id

    WHERE t.payment_type = ?

      AND t.created_at >= ?

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

    LIMIT ?

`,


    // ==========================================================
    // TRANSACTION VOLUME
    // ==========================================================

    GET_TRANSACTION_VOLUME: `

        SELECT

            DATE_FORMAT(
                created_at,
                '%Y-%m-%d'
            ) AS report_date,

            COUNT(*) AS total_transactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,

            SUM(
                CASE
                    WHEN status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,

            SUM(
                CASE
                    WHEN status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS created_transactions,

            SUM(
                CASE
                    WHEN status = 'AUTHORIZED'
                    THEN 1
                    ELSE 0
                END
            ) AS authorized_transactions,

            SUM(
                CASE
                    WHEN status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,

            SUM(
                CASE
                    WHEN status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded_transactions,

            SUM(
                CASE
                    WHEN status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS partially_refunded_transactions,

            SUM(
                CASE
                    WHEN status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargeback_transactions

        FROM transactions

        WHERE payment_type = ?

          AND created_at >= ?

          AND created_at < ?

          AND (
                ? IS NULL
                OR merchant_id = ?
          )

        GROUP BY
            DATE_FORMAT(
                created_at,
                '%Y-%m-%d'
            )

        ORDER BY
            report_date ASC

    `,


    // ==========================================================
    // SUCCESS RATE
    // ==========================================================

    GET_SUCCESS_RATE: `

        SELECT

            COUNT(*) AS total_transactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,

            SUM(
                CASE
                    WHEN status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,

            SUM(
                CASE
                    WHEN status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS created_transactions,

            SUM(
                CASE
                    WHEN status = 'AUTHORIZED'
                    THEN 1
                    ELSE 0
                END
            ) AS authorized_transactions,

            SUM(
                CASE
                    WHEN status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,

            SUM(
                CASE
                    WHEN status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded_transactions,

            SUM(
                CASE
                    WHEN status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS partially_refunded_transactions,

            SUM(
                CASE
                    WHEN status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargeback_transactions

        FROM transactions

        WHERE payment_type = ?

          AND created_at >= ?

          AND created_at < ?

          AND (
                ? IS NULL
                OR merchant_id = ?
          )

    `,


    // ==========================================================
    // RECENT TRANSACTIONS
    // ==========================================================
GET_RECENT_TRANSACTIONS: `

    SELECT

        t.transaction_id,
        t.transaction_ref,

        t.order_id,

        t.gateway_payment_id AS payment_id,

        t.merchant_id,

        t.customer_name,
        t.customer_email,
        t.customer_phone,

        t.amount,
        t.currency,

        t.payment_method,

        t.status AS transaction_status,

        t.gateway_response,

        t.created_at AS created_date,

        t.settled_at AS settlement_date

    FROM transactions t

    WHERE t.payment_type = ?

      AND (
            ? IS NULL
            OR t.merchant_id = ?
      )

    ORDER BY
        t.created_at DESC,
        t.transaction_id DESC

    LIMIT 20

`,
    // ==========================================================
    // PAYMENT METHOD ANALYTICS
    // ==========================================================

    GET_PAYMENT_METHOD_ANALYTICS: `

        SELECT

            payment_method,

            COUNT(*) AS total_transactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,

            SUM(
                CASE
                    WHEN status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,

            SUM(
                CASE
                    WHEN status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS created_transactions,

            SUM(
                CASE
                    WHEN status = 'AUTHORIZED'
                    THEN 1
                    ELSE 0
                END
            ) AS authorized_transactions,

            SUM(
                CASE
                    WHEN status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,

            SUM(
                CASE
                    WHEN status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded_transactions,

            SUM(
                CASE
                    WHEN status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS partially_refunded_transactions,

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
                        WHEN status = 'SUCCESS'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS successful_amount

        FROM transactions

        WHERE payment_type = ?

          AND created_at >= ?

          AND created_at < ?

          AND (
                ? IS NULL
                OR merchant_id = ?
          )

        GROUP BY
            payment_method

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // TRANSACTION STATUS ANALYTICS
    // ==========================================================

    GET_TRANSACTION_STATUS_ANALYTICS: `

        SELECT

            status AS transaction_status,

            COUNT(*) AS total_transactions,

            COALESCE(
                SUM(amount),
                0
            ) AS total_amount

        FROM transactions

        WHERE payment_type = ?

          AND created_at >= ?

          AND created_at < ?

          AND (
                ? IS NULL
                OR merchant_id = ?
          )

        GROUP BY
            status

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // TRANSACTIONS LIST
    // ==========================================================

    GET_TRANSACTIONS: `

        SELECT

            t.transaction_id,
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
            t.gateway_name,
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

        FROM transactions t

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE

            (? IS NULL OR t.payment_type = ?)

            AND (? IS NULL OR t.merchant_id = ?)

            AND (? IS NULL OR t.status = ?)

            AND (? IS NULL OR t.payment_method = ?)

            AND (? IS NULL OR t.gateway_name = ?)

            AND (? IS NULL OR t.created_at >= ?)

            AND (? IS NULL OR t.created_at < ?)

            AND (
                ? IS NULL
                OR t.transaction_ref LIKE CONCAT('%', ?, '%')
                OR t.order_id LIKE CONCAT('%', ?, '%')
                OR t.gateway_payment_id LIKE CONCAT('%', ?, '%')
                OR t.customer_name LIKE CONCAT('%', ?, '%')
                OR t.customer_email LIKE CONCAT('%', ?, '%')
            )

        ORDER BY
            t.created_at DESC

    `,


    // ==========================================================
    // LATEST TRANSACTIONS
    // ==========================================================

    GET_LATEST_TRANSACTIONS: `

        SELECT

            t.transaction_id,
            t.transaction_ref,

            t.merchant_id,
            m.business_name,

            t.order_id,

            t.customer_name,
            t.customer_email,

            t.amount,
            t.currency,

            t.payment_method,
            t.gateway_name,
            t.payment_type,

            t.status,

            t.merchant_fee,
            t.gateway_fee,
            t.gateway_tax,
            t.net_amount,

            t.settlement_status,

            t.created_at,
            t.completed_at

        FROM transactions t

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE

            (
                ? IS NULL
                OR t.payment_type = ?
            )

            AND (
                ? IS NULL
                OR t.merchant_id = ?
            )

        ORDER BY
            t.created_at DESC

        LIMIT ?

    `,


    // ==========================================================
    // TRANSACTION DASHBOARD
    // ==========================================================

    GET_TRANSACTION_DASHBOARD: `

        SELECT

            COUNT(*) AS total_transactions,

            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ) AS successful_transactions,

            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_transactions,

            SUM(
                CASE
                    WHEN status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions,

            SUM(
                CASE
                    WHEN status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ) AS created_transactions,

            SUM(
                CASE
                    WHEN status = 'AUTHORIZED'
                    THEN 1
                    ELSE 0
                END
            ) AS authorized_transactions,

            SUM(
                CASE
                    WHEN status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_transactions,

            SUM(
                CASE
                    WHEN status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS refunded_transactions,

            SUM(
                CASE
                    WHEN status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ) AS partially_refunded_transactions,

            SUM(
                CASE
                    WHEN status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ) AS chargeback_transactions,

            COALESCE(
                SUM(amount),
                0
            ) AS total_amount,

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

            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'CHARGEBACK'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS chargeback_amount

        FROM transactions

        WHERE

            (
                ? IS NULL
                OR payment_type = ?
            )

            AND (
                ? IS NULL
                OR merchant_id = ?
            )

            AND created_at >= ?

            AND created_at < ?

    `,


    // ==========================================================
    // TRANSACTION DETAILS
    // ==========================================================

    GET_TRANSACTION_BY_ID: `

        SELECT

            t.transaction_id,
            t.transaction_ref,

            t.merchant_id,
            m.business_name,

            t.order_id,
            t.gateway_order_id,
            t.gateway_payment_id,
            t.gateway_reference,
            t.gateway_response,

            t.customer_name,
            t.customer_email,
            t.customer_phone,

            t.amount,
            t.currency,

            t.payment_method,
            t.gateway_name,
            t.payment_type,

            t.status,
            t.completion_source,

            t.merchant_fee,
            t.gateway_fee,
            t.gateway_tax,
            t.net_amount,

            t.settlement_status,
            t.settled_at,

            t.failure_code,
            t.failure_message,

            t.attempt_count,
            t.expires_at,

            t.idempotency_key,
            t.client_ip,
            t.user_agent,

            t.remarks,

            t.created_at,
            t.completed_at,
            t.updated_at

        FROM transactions t

        INNER JOIN merchants m
            ON m.merchant_id = t.merchant_id

        WHERE t.transaction_id = ?

        LIMIT 1

    `

});


// ==========================================================
// EXPORT
// ==========================================================

module.exports = DASHBOARD_QUERIES;
