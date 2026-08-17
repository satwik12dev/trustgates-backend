// ==========================================================
// Find Webhook By Event ID
// ==========================================================

const FIND_WEBHOOK_BY_EVENT_ID = `

    SELECT

        webhook_id,
        processing_status

    FROM webhook_logs

    WHERE event_id = ?

    LIMIT 1

`;

// ==========================================================
// Create Webhook Log
// ==========================================================

const CREATE_WEBHOOK_LOG = `

    INSERT INTO webhook_logs (

        event_id,
        event_type,
        merchant_id,
        transaction_reference,
        gateway_order_id,
        gateway_payment_id,
        webhook_signature,
        payload,
        processing_status

    )

    VALUES (

        ?, ?, ?, ?, ?, ?, ?, ?, ?

    )

`;

// ==========================================================
// Mark Webhook Success
// ==========================================================

const UPDATE_WEBHOOK_SUCCESS = `

    UPDATE webhook_logs

    SET

        processing_status = 'SUCCESS',

        processed_at = NOW(),

        error_message = NULL

    WHERE webhook_id = ?

`;

// ==========================================================
// Mark Webhook Failed
// ==========================================================

const UPDATE_WEBHOOK_FAILED = `

    UPDATE webhook_logs

    SET

        processing_status = 'FAILED',

        error_message = ?,

        processed_at = NOW()

    WHERE webhook_id = ?

`;

// ==========================================================
// Export
// ==========================================================

module.exports = {

    FIND_WEBHOOK_BY_EVENT_ID,

    CREATE_WEBHOOK_LOG,

    UPDATE_WEBHOOK_SUCCESS,

    UPDATE_WEBHOOK_FAILED

};