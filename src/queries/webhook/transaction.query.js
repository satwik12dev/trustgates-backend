// ==========================================================
// Find Transaction By Gateway Order ID
// ==========================================================

const FIND_TRANSACTION_BY_GATEWAY_ORDER_ID = `

    SELECT

        transaction_id,

        merchant_id,

        transaction_ref,

        order_id,

        gateway_order_id,

        gateway_payment_id,

        gateway_reference,

        amount,

        currency,

        payment_method,

        status,

        attempt_count

    FROM transactions

    WHERE gateway_order_id = ?

    LIMIT 1

`;

// ==========================================================
// Check Transaction Status
// ==========================================================

const CHECK_TRANSACTION_STATUS = `

    SELECT

    transaction_id,

    status

FROM transactions

WHERE transaction_id = ?

LIMIT 1

FOR UPDATE;

`;

// ==========================================================
// Update Transaction Success
// ==========================================================

const UPDATE_TRANSACTION_SUCCESS = `

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

        attempt_count = attempt_count + 1

    WHERE transaction_id = ?

`;

// ==========================================================
// Update Transaction Failed
// ==========================================================

const UPDATE_TRANSACTION_FAILED = `

    UPDATE transactions

    SET

        gateway_payment_id = ?,

        gateway_response = ?,

        status = 'FAILED',

        completion_source = 'WEBHOOK',

        failure_code = ?,

        failure_message = ?,

        completed_at = NOW(),

        attempt_count = attempt_count + 1

    WHERE transaction_id = ?

`;

// ==========================================================
// Update Transaction Refunded
// ==========================================================

const UPDATE_TRANSACTION_REFUNDED = `

    UPDATE transactions

    SET

        status = 'REFUNDED',

        completion_source = 'WEBHOOK',

        completed_at = NOW()

    WHERE transaction_id = ?

`;

// ==========================================================
// Export
// ==========================================================

module.exports = {

    FIND_TRANSACTION_BY_GATEWAY_ORDER_ID,

    CHECK_TRANSACTION_STATUS,

    UPDATE_TRANSACTION_SUCCESS,

    UPDATE_TRANSACTION_FAILED,

    UPDATE_TRANSACTION_REFUNDED

};