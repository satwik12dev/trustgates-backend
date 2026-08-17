// ==========================================================
// Refund Status Query
// ==========================================================


const REFUND_STATUS_QUERIES = {


    GET_REFUND_STATUS: `

        SELECT


            refund_id,

            refund_reference,

            transaction_id,

            gateway_refund_id,

            amount,

            currency,

            refund_type,

            refund_status,

            refund_reason,

            completion_source,

            processed_at,

            created_at


        FROM transaction_refunds


        WHERE refund_id = ?

        AND merchant_id = ?


        LIMIT 1


    `


};


module.exports = REFUND_STATUS_QUERIES;