const MERCHANT_FEE_QUERIES = Object.freeze({

    GET_MY_FEES: `

        SELECT

            fee_id,

            merchant_id,

            fee_type,

            fee_value,

            min_amount,

            max_amount,

            minimum_fee,

            maximum_fee,

            status,

            remarks,

            created_at,

            updated_at

        FROM merchant_fees

        WHERE merchant_id = ?

        ORDER BY
            created_at DESC

    `

});


module.exports = MERCHANT_FEE_QUERIES;