const RECENT_TRANSACTIONS_QUERIES = {

    GET_RECENT_TRANSACTIONS: `

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

            gateway_name,

            status,

            completion_source,

            created_at,
            completed_at

        FROM transactions

        WHERE merchant_id = ?

        ORDER BY
            created_at DESC,
            transaction_id DESC

        LIMIT ?

    `,

    GET_RECENT_TRANSACTIONS_COUNT: `

        SELECT

            COUNT(*) AS total_transactions

        FROM transactions

        WHERE merchant_id = ?

    `

};

module.exports = RECENT_TRANSACTIONS_QUERIES;
