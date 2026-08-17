const REFUND_QUERIES = Object.freeze({

    // ==========================================================
    // REFUND LIST / DASHBOARD
    // ==========================================================

    GET_REFUNDS: `

    SELECT

        r.refund_id,
        r.refund_reference,

        r.request_id,

        r.merchant_id,
        m.business_name,

        r.transaction_id,
        t.transaction_ref,
        t.order_id,

        r.gateway_refund_id,
        r.gateway_payment_id,
        r.gateway_order_id,

        r.amount,
        r.fee_amount,
        r.total_debit_amount,
        r.currency,

        r.refund_type,
        r.refund_status,

        r.refund_reason,

        r.completion_source,

        r.failure_code,
        r.failure_message,

        r.processed_at,
        r.created_at,
        r.updated_at

    FROM transaction_refunds r

    INNER JOIN transactions t
        ON t.transaction_id = r.transaction_id

    INNER JOIN merchants m
        ON m.merchant_id = r.merchant_id

    WHERE

        (? IS NULL OR r.merchant_id = ?)

        AND (? IS NULL OR r.refund_status = ?)

        AND (? IS NULL OR r.refund_type = ?)

        AND (? IS NULL OR r.created_at >= ?)

        AND (? IS NULL OR r.created_at < ?)

        AND (
            ? IS NULL
            OR r.refund_reference LIKE ?
            OR r.gateway_refund_id LIKE ?
            OR r.gateway_payment_id LIKE ?
            OR t.transaction_ref LIKE ?
            OR t.order_id LIKE ?
        )

    ORDER BY
        r.created_at DESC

`,


    // ==========================================================
    // REFUND SUMMARY
    // ==========================================================

    GET_REFUND_SUMMARY: `

        SELECT

            COUNT(*) AS total_refunds,

            SUM(
                CASE
                    WHEN refund_status = 'PROCESSED'
                    THEN 1
                    ELSE 0
                END
            ) AS processed_refunds,

            SUM(
                CASE
                    WHEN refund_status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_refunds,

            SUM(
                CASE
                    WHEN refund_status IN (
                        'CREATED',
                        'PROCESSING'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS pending_refunds,

            COALESCE(
                SUM(amount),
                0
            ) AS refund_amount,

            COALESCE(
                SUM(fee_amount),
                0
            ) AS refund_fees,

            COALESCE(
                SUM(total_debit_amount),
                0
            ) AS total_debit_amount

        FROM transaction_refunds

        WHERE

            (
                ? IS NULL
                OR merchant_id = ?
            )

            AND created_at >= ?

            AND created_at < ?

    `,


    // ==========================================================
    // RECENT REFUNDS
    // ==========================================================

    GET_RECENT_REFUNDS: `

        SELECT

            r.refund_id,
            r.refund_reference,

            r.merchant_id,
            m.business_name,

            r.transaction_id,
            t.transaction_ref,
            t.order_id,

            r.amount,
            r.fee_amount,
            r.total_debit_amount,

            r.currency,

            r.refund_type,
            r.refund_status,

            r.refund_reason,

            r.processed_at,
            r.created_at

        FROM transaction_refunds r

        INNER JOIN transactions t
            ON t.transaction_id = r.transaction_id

        INNER JOIN merchants m
            ON m.merchant_id = r.merchant_id

        WHERE

            (
                ? IS NULL
                OR r.merchant_id = ?
            )

        ORDER BY
            r.created_at DESC

        LIMIT ?

    `,


    // ==========================================================
    // REFUND ANALYTICS
    // ==========================================================
    // Date-wise refund performance
    // ==========================================================

    GET_REFUND_ANALYTICS: `

    SELECT

        DATE(r.created_at) AS report_date,

        COUNT(*) AS total_refunds,

        SUM(
            CASE
                WHEN r.refund_status = 'PROCESSED'
                THEN 1
                ELSE 0
            END
        ) AS processed_refunds,

        SUM(
            CASE
                WHEN r.refund_status = 'FAILED'
                THEN 1
                ELSE 0
            END
        ) AS failed_refunds,

        SUM(
            CASE
                WHEN r.refund_status IN (
                    'CREATED',
                    'PROCESSING',
                    'PENDING'
                )
                THEN 1
                ELSE 0
            END
        ) AS pending_refunds,

        COALESCE(
            SUM(r.amount),
            0
        ) AS refund_amount,

        COALESCE(
            SUM(r.fee_amount),
            0
        ) AS refund_fees,

        COALESCE(
            SUM(
                CASE
                    WHEN r.refund_status IN (
                        'PROCESSED',
                        'PROCESSING',
                        'PENDING'
                    )
                    THEN
                        COALESCE(r.amount, 0)
                        +
                        COALESCE(r.fee_amount, 0)
                    ELSE 0
                END
            ),
            0
        ) AS total_debit_amount

    FROM transaction_refunds r

    WHERE
        (
            ? IS NULL
            OR r.merchant_id = ?
        )

        AND r.created_at >= ?

        AND r.created_at < ?

    GROUP BY
        DATE(r.created_at)

    ORDER BY
        report_date ASC

`,


    // ==========================================================
    // MERCHANT REFUND ANALYTICS
    // ==========================================================

    GET_MERCHANT_REFUND_ANALYTICS: `

        SELECT

            r.merchant_id,

            m.business_name,

            COUNT(*) AS total_refunds,

            SUM(
                CASE
                    WHEN r.refund_status = 'PROCESSED'
                    THEN 1
                    ELSE 0
                END
            ) AS processed_refunds,

            SUM(
                CASE
                    WHEN r.refund_status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_refunds,

            SUM(
                CASE
                    WHEN r.refund_status IN (
                        'CREATED',
                        'PROCESSING'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS pending_refunds,

            COALESCE(
                SUM(r.amount),
                0
            ) AS refund_amount,

            COALESCE(
                SUM(r.fee_amount),
                0
            ) AS refund_fees,

            COALESCE(
                SUM(r.total_debit_amount),
                0
            ) AS total_debit_amount

        FROM transaction_refunds r

        INNER JOIN merchants m
            ON m.merchant_id = r.merchant_id

        WHERE

            r.created_at >= ?

            AND r.created_at < ?

            AND (
                ? IS NULL
                OR r.merchant_id = ?
            )

        GROUP BY

            r.merchant_id,
            m.business_name

        ORDER BY
            refund_amount DESC

    `,


    // ==========================================================
    // REFUND STATUS ANALYTICS
    // ==========================================================
    GET_REFUND_STATUS_ANALYTICS: `

    SELECT

        refund_status,

        COUNT(*) AS total_refunds,

        COALESCE(
            SUM(amount),
            0
        ) AS refund_amount,

        COALESCE(
            SUM(fee_amount),
            0
        ) AS refund_fees,

        COALESCE(
            SUM(total_debit_amount),
            0
        ) AS total_debit_amount

    FROM transaction_refunds

    WHERE

        created_at >= ?

        AND created_at < ?

        AND (
            ? IS NULL
            OR merchant_id = ?
        )

    GROUP BY
        refund_status

    ORDER BY
        total_refunds DESC

`,

});

module.exports = REFUND_QUERIES;