// ==========================================================
// Payment Status Queries
// ==========================================================


const PAYMENT_STATUS_QUERIES = {


    GET_PAYMENT_STATUS: `

        SELECT

            transaction_id,

            transaction_ref,

            order_id,

            amount,

            currency,

            payment_method,

            payment_type,

            payment_provider,

            gateway_order_id,

            gateway_payment_id,

            status,

            completion_source,

            created_at,

            completed_at


        FROM transactions


        WHERE transaction_id = ?

        AND merchant_id = ?

        LIMIT 1

    `


};


module.exports = PAYMENT_STATUS_QUERIES;