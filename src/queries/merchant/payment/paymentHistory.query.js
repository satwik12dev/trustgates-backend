const PAYMENT_HISTORY_QUERIES = {


    // ==================================================
    // Get Merchant Payment History
    // ==================================================

    GET_PAYMENT_HISTORY: `

        SELECT

            transaction_id,

            transaction_ref,

            order_id,

            customer_name,

            customer_email,

            customer_phone,

            amount,

            currency,

            payment_method,

            payment_type,

            gateway_name,

            gateway_order_id,

            gateway_payment_id,

            gateway_reference,

            status,

            completion_source,

            settlement_status,

            merchant_fee,

            gateway_fee,

            gateway_tax,

            failure_code,

            failure_message,

            created_at,

            completed_at


        FROM transactions


        WHERE merchant_id = ?


        ORDER BY created_at DESC


        LIMIT ?

        OFFSET ?

    `,



    // ==================================================
    // Count Payment History
    // ==================================================

    COUNT_PAYMENT_HISTORY: `

        SELECT

            COUNT(*) AS total


        FROM transactions


        WHERE merchant_id = ?

    `,



    // ==================================================
    // Filter By Status
    // ==================================================

    GET_PAYMENT_HISTORY_BY_STATUS: `

        SELECT

            transaction_id,

            transaction_ref,

            order_id,

            customer_name,

            customer_email,

            amount,

            currency,

            payment_method,

            payment_type,

            status,

            created_at


        FROM transactions


        WHERE merchant_id = ?

        AND status = ?


        ORDER BY created_at DESC


        LIMIT ?

        OFFSET ?

    `


};


module.exports = PAYMENT_HISTORY_QUERIES;