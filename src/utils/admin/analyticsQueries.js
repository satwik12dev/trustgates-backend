const ANALYTICS_QUERIES = Object.freeze({

    // ==========================================================
    // ANALYTICS OVERVIEW
    // ==========================================================
    // Complete analytics summary.
    //
    // Returns:
    // - Total transactions
    // - Successful
    // - Failed
    // - Pending
    // - Refunded
    // - Chargebacks
    // - Total revenue
    // - Average transaction value
    // ==========================================================

    GET_ANALYTICS_OVERVIEW: `

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
                WHEN status = 'REFUNDED'
                THEN 1
                ELSE 0
            END
        ) AS refunded_transactions,

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
        ) AS total_revenue,

        COALESCE(
            AVG(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN amount
                    ELSE NULL
                END
            ),
            0
        ) AS average_transaction_value

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
    // TRANSACTION TREND
    // ==========================================================
    // Date-wise transaction volume.
    // ==========================================================

    GET_TRANSACTION_TREND: `

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
                    WHEN status IN (
                        'PENDING'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS pending_transactions

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
    // REVENUE TREND
    // ==========================================================
    // Date-wise successful transaction revenue.
    //
    // NO FEES.
    // ==========================================================

    GET_REVENUE_TREND: `

        SELECT

            DATE_FORMAT(
                created_at,
                '%Y-%m-%d'
            ) AS report_date,

            COUNT(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
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
            ) AS revenue

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
    // PAYMENT METHOD DISTRIBUTION
    // ==========================================================

    GET_PAYMENT_METHOD_DISTRIBUTION: `

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
    // PAYMENT PROVIDER DISTRIBUTION
    // ==========================================================
    // Uses transactions.gateway_name.
    // ==========================================================

    GET_PAYMENT_PROVIDER_DISTRIBUTION: `

        SELECT

            gateway_name AS payment_provider,

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
            gateway_name

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // MERCHANT PERFORMANCE
    // ==========================================================
    // Merchant-wise performance.
    //
    // Ranking is based on transaction count.
    // NO FEES.
    // ==========================================================

    GET_MERCHANT_PERFORMANCE: `

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
        WHEN t.status = 'CANCELLED'
        THEN 1
        ELSE 0
    END
) AS cancelled_transactions,

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
            total_transactions DESC

        LIMIT ?

    `,


    // ==========================================================
    // HOURLY TRANSACTIONS
    // ==========================================================
    // 0 - 23 hour transaction activity.
    // ==========================================================

    GET_HOURLY_TRANSACTIONS: `

        SELECT

            HOUR(created_at) AS transaction_hour,

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
            ) AS pending_transactions

        FROM transactions

        WHERE payment_type = ?

          AND created_at >= ?

          AND created_at < ?

          AND (
                ? IS NULL
                OR merchant_id = ?
          )

        GROUP BY
            HOUR(created_at)

        ORDER BY
            transaction_hour ASC

    `,


    // ==========================================================
    // CURRENCY ANALYTICS
    // ==========================================================

    GET_CURRENCY_ANALYTICS: `

        SELECT

            currency,

            COUNT(*) AS total_transactions,

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
            currency

        ORDER BY
            total_transactions DESC

    `,


    // ==========================================================
    // STATUS ANALYTICS
    // ==========================================================
    // Every actual transaction status separately.
    //
    // NO STATUS MERGING.
    // ==========================================================

    GET_STATUS_ANALYTICS: `

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

    `

});


module.exports = ANALYTICS_QUERIES;