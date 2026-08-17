const REFUND_HISTORY_QUERIES = {

    GET_REFUND_HISTORY: `

        SELECT

            /* ==========================================
               TRANSACTION REFUND / PAYOUT DATA
               ========================================== */

            tr.refund_id,

            tr.refund_reference,

            tr.request_id,

            tr.merchant_id,

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


            /* ==========================================
               REFUND REQUEST DATA
               ========================================== */

            rr.request_reference,

            rr.transaction_reference,

            rr.requested_amount,

            rr.approved_amount,

            rr.processed_amount,

            rr.status AS request_status,

            rr.reason AS request_reason,


            /* ==========================================
               ORIGINAL TRANSACTION
               ========================================== */

            t.order_id,

            t.payment_method,

            t.payment_type,

            t.amount AS transaction_amount


        FROM transaction_refunds tr


        LEFT JOIN refund_requests rr

            ON tr.request_id = rr.request_id


        LEFT JOIN transactions t

            ON tr.transaction_id = t.transaction_id


        WHERE tr.merchant_id = ?


        ORDER BY tr.created_at DESC


        LIMIT ? OFFSET ?

    `,


    GET_REFUND_COUNT: `

        SELECT

            COUNT(*) AS total

        FROM transaction_refunds

        WHERE merchant_id = ?

    `

};


module.exports = REFUND_HISTORY_QUERIES;