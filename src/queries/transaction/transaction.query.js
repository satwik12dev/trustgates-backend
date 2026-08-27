const TRANSACTION_QUERIES = {

    // ==================================================
    // Find Transaction By ID
    // ==================================================

    FIND_TRANSACTION_BY_ID: `

        SELECT

            transaction_id,
            merchant_id,

            transaction_ref,
            order_id,

            gateway_order_id,
            gateway_payment_id,
            gateway_reference,

            gateway_response,

            customer_name,
            customer_email,
            customer_phone,

            amount,
            currency,

            payment_method,
            gateway_name,
            payment_type,

            status,
            completion_source,

            merchant_fee,
            gateway_fee,
            gateway_tax,
            net_amount,

            settlement_status,
            settled_at,

            failure_code,
            failure_message,

            attempt_count,
            expires_at,

            idempotency_key,

            client_ip,
            user_agent,

            remarks,

            created_at,
            completed_at,
            updated_at

        FROM transactions

        WHERE transaction_id = ?

        LIMIT 1

    `,


    // ==================================================
    // Find Transaction By Gateway Order ID
    // ==================================================

    FIND_TRANSACTION_BY_GATEWAY_ORDER_ID: `

        SELECT

            transaction_id,
            merchant_id,

            transaction_ref,
            order_id,

            gateway_order_id,
            gateway_payment_id,
            gateway_reference,

            gateway_response,

            customer_name,
            customer_email,
            customer_phone,

            amount,
            currency,

            payment_method,
            gateway_name,
            payment_type,

            status,
            completion_source,

            merchant_fee,
            gateway_fee,
            gateway_tax,
            net_amount,

            settlement_status,
            settled_at,

            failure_code,
            failure_message,

            attempt_count,
            expires_at,

            idempotency_key,

            client_ip,
            user_agent,

            remarks,

            created_at,
            completed_at,
            updated_at

        FROM transactions

        WHERE gateway_order_id = ?

        LIMIT 1

    `,


    // ==================================================
    // Lock Transaction By Gateway Order ID
    // ==================================================

    LOCK_TRANSACTION_BY_GATEWAY_ORDER_ID: `

        SELECT

            transaction_id,
            merchant_id,

            transaction_ref,
            order_id,

            gateway_order_id,
            gateway_payment_id,
            gateway_reference,

            gateway_response,

            customer_name,
            customer_email,
            customer_phone,

            amount,
            currency,

            payment_method,
            gateway_name,
            payment_type,

            status,
            completion_source,

            merchant_fee,
            gateway_fee,
            gateway_tax,
            net_amount,

            settlement_status,
            settled_at,

            failure_code,
            failure_message,

            attempt_count,
            expires_at,

            idempotency_key,

            client_ip,
            user_agent,

            remarks,

            created_at,
            completed_at,
            updated_at

        FROM transactions

        WHERE gateway_order_id = ?

        LIMIT 1

        FOR UPDATE

    `,


    // ==================================================
    // Find Transaction By Gateway Payment ID
    // ==================================================

    FIND_TRANSACTION_BY_GATEWAY_PAYMENT_ID: `

        SELECT

            transaction_id,
            merchant_id,

            transaction_ref,
            order_id,

            gateway_order_id,
            gateway_payment_id,
            gateway_reference,

            gateway_response,

            customer_name,
            customer_email,
            customer_phone,

            amount,
            currency,

            payment_method,
            gateway_name,
            payment_type,

            status,
            completion_source,

            merchant_fee,
            gateway_fee,
            gateway_tax,
            net_amount,

            settlement_status,
            settled_at,

            failure_code,
            failure_message,

            attempt_count,
            expires_at,

            idempotency_key,

            client_ip,
            user_agent,

            remarks,

            created_at,
            completed_at,
            updated_at

        FROM transactions

        WHERE gateway_payment_id = ?

        LIMIT 1

    `,


    // ==================================================
    // Lock Transaction By ID
    // ==================================================

    LOCK_TRANSACTION_BY_ID: `

        SELECT

            transaction_id,
            merchant_id,

            transaction_ref,
            order_id,

            gateway_order_id,
            gateway_payment_id,
            gateway_reference,

            gateway_response,

            customer_name,
            customer_email,
            customer_phone,

            amount,
            currency,

            payment_method,
            gateway_name,
            payment_type,

            status,
            completion_source,

            merchant_fee,
            gateway_fee,
            gateway_tax,
            net_amount,

            settlement_status,
            settled_at,

            failure_code,
            failure_message,

            attempt_count,
            expires_at,

            idempotency_key,

            client_ip,
            user_agent,

            remarks,

            created_at,
            completed_at,
            updated_at

        FROM transactions

        WHERE transaction_id = ?

        LIMIT 1

        FOR UPDATE

    `,


    // ==================================================
    // Update Transaction Success
    // ==================================================

    UPDATE_TRANSACTION_SUCCESS: `

        UPDATE transactions

        SET

            gateway_payment_id = ?,

            gateway_reference = ?,

            gateway_response = ?,

            status = 'SUCCESS',

            completion_source = 'WEBHOOK',

            gateway_fee = ?,

            gateway_tax = ?,

            completed_at = NOW(),

            failure_code = NULL,

            failure_message = NULL,

            attempt_count = attempt_count + 1,

            updated_at = NOW()

        WHERE transaction_id = ?

    `,


    // ==================================================
    // Update Transaction Failed
    // ==================================================

    UPDATE_TRANSACTION_FAILED: `

        UPDATE transactions

        SET

            gateway_payment_id = ?,

            gateway_reference = ?,

            gateway_response = ?,

            status = 'FAILED',

            completion_source = 'WEBHOOK',

            failure_code = ?,

            failure_message = ?,

            completed_at = NOW(),

            attempt_count = attempt_count + 1,

            updated_at = NOW()

        WHERE transaction_id = ?

    `,


    // ==================================================
    // Update Transaction Authorized
    // ==================================================

    UPDATE_TRANSACTION_AUTHORIZED: `

        UPDATE transactions

        SET

            gateway_payment_id = ?,

            gateway_reference = ?,

            gateway_response = ?,

            status = 'AUTHORIZED',

            completion_source = 'WEBHOOK',

            attempt_count = attempt_count + 1,

            updated_at = NOW()

        WHERE transaction_id = ?

    `,


    // ==================================================
    // Update Transaction Refunded
    // ==================================================

    UPDATE_TRANSACTION_REFUNDED: `

        UPDATE transactions

        SET

            status = 'REFUNDED',

            completion_source = 'WEBHOOK',

            completed_at = NOW(),

            updated_at = NOW()

        WHERE transaction_id = ?

    `,


    // ==================================================
    // Update Transaction Partially Refunded
    // ==================================================

    UPDATE_TRANSACTION_PARTIALLY_REFUNDED: `

        UPDATE transactions

        SET

            status = 'PARTIALLY_REFUNDED',

            completion_source = 'WEBHOOK',

            updated_at = NOW()

        WHERE transaction_id = ?

    `,


    // ==================================================
    // Update Transaction Gateway Response
    // ==================================================

    UPDATE_GATEWAY_RESPONSE: `

        UPDATE transactions

        SET

            gateway_response = ?,

            updated_at = NOW()

        WHERE transaction_id = ?

    `,


    // ==================================================
    // Get Transaction Status
    // ==================================================

    GET_TRANSACTION_STATUS: `

        SELECT

            transaction_id,

            merchant_id,

            gateway_order_id,

            gateway_payment_id,

            amount,

            currency,

            status,

            completion_source,

            attempt_count

        FROM transactions

        WHERE transaction_id = ?

        LIMIT 1

    `,


    // ==================================================
    // Find Transaction By Reference
    // ==================================================

    FIND_TRANSACTION_BY_REFERENCE: `

        SELECT

            transaction_id,
            merchant_id,

            transaction_ref,
            order_id,

            gateway_order_id,
            gateway_payment_id,

            amount,
            currency,

            payment_method,
            gateway_name,
            payment_type,

            status,
            completion_source,

            merchant_fee,
            gateway_fee,
            gateway_tax,
            net_amount,

            settlement_status,

            attempt_count,

            created_at,
            completed_at,
            updated_at

        FROM transactions

        WHERE transaction_ref = ?

        LIMIT 1

    `

};


module.exports = TRANSACTION_QUERIES;