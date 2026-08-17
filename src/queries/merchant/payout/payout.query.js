const PAYOUT_ANALYTICS_QUERY = `
    SELECT

        COUNT(*) AS total_payout_transactions,

        COALESCE(SUM(amount), 0.00)
            AS total_payout_amount,

        SUM(
            CASE
                WHEN refund_status = 'PROCESSED'
                THEN 1 ELSE 0
            END
        ) AS successful_transactions,

        COALESCE(
            SUM(
                CASE
                    WHEN refund_status = 'PROCESSED'
                    THEN amount
                    ELSE 0
                END
            ),
            0.00
        ) AS successful_payout_amount,

        SUM(
            CASE
                WHEN refund_status = 'FAILED'
                THEN 1 ELSE 0
            END
        ) AS failed_transactions,

        SUM(
            CASE
                WHEN refund_status = 'CREATED'
                THEN 1 ELSE 0
            END
        ) AS created_transactions,

        SUM(
            CASE
                WHEN refund_status = 'PROCESSING'
                THEN 1 ELSE 0
            END
        ) AS processing_transactions,

        SUM(
            CASE
                WHEN refund_status = 'PROCESSED'
                THEN 1 ELSE 0
            END
        ) AS processed_transactions,

        ROUND(
            (
                SUM(
                    CASE
                        WHEN refund_status = 'PROCESSED'
                        THEN 1 ELSE 0
                    END
                )
                / NULLIF(COUNT(*), 0)
            ) * 100,
            2
        ) AS success_percentage,

        COALESCE(
            AVG(
                CASE
                    WHEN refund_status = 'PROCESSED'
                    THEN amount
                END
            ),
            0.00
        ) AS average_payout_amount,

        COALESCE(SUM(fee_amount), 0.00)
            AS total_payout_fee,

        COALESCE(SUM(total_debit_amount), 0.00)
            AS total_debit_amount

    FROM transaction_refunds

    WHERE merchant_id = ?
`;


const PAYOUT_HISTORY_QUERY = `
    SELECT

        tr.refund_id,
        tr.refund_reference,

        tr.request_id,

        tr.transaction_id,

        tr.gateway_refund_id,
        tr.gateway_payment_id,
        tr.gateway_order_id,

        tr.amount,
        tr.fee_amount,
        tr.total_debit_amount,

        tr.currency,

        tr.refund_type,
        tr.refund_status,

        tr.refund_reason,

        tr.completion_source,

        tr.failure_code,
        tr.failure_message,

        tr.processed_at,
        tr.created_at,
        tr.updated_at,

        t.order_id,
        t.payment_method,
        t.payment_type,
        t.amount AS transaction_amount

    FROM transaction_refunds tr

    LEFT JOIN transactions t
        ON tr.transaction_id = t.transaction_id

    WHERE tr.merchant_id = ?

    ORDER BY tr.created_at DESC

    LIMIT 20
`;


module.exports = {
    PAYOUT_ANALYTICS_QUERY,
    PAYOUT_HISTORY_QUERY
};