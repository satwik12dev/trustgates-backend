// ==========================================================
// Merchant Webhook Queries
// ==========================================================


const WEBHOOK_QUERIES = {


    // ======================================================
    // Create Webhook
    // ======================================================

    CREATE_WEBHOOK: `

        INSERT INTO merchant_webhooks
        (

            merchant_id,

            webhook_url,

            webhook_secret,

            events,

            status

        )

        VALUES (?, ?, ?, ?, ?)

    `,



    // ======================================================
    // Get Merchant Webhooks
    // ======================================================

    GET_MERCHANT_WEBHOOKS: `

        SELECT

            webhook_id,

            merchant_id,

            webhook_url,

            events,

            status,

            failure_count,

            last_triggered_at,

            last_response_code,

            created_at,

            updated_at


        FROM merchant_webhooks


        WHERE merchant_id = ?


        ORDER BY created_at DESC

    `,



    // ======================================================
    // Get Single Webhook
    // ======================================================

    GET_WEBHOOK_BY_ID: `

        SELECT

            webhook_id,

            merchant_id,

            webhook_url,

            webhook_secret,

            events,

            status,

            failure_count,

            last_triggered_at,

            last_response_code,

            created_at,

            updated_at


        FROM merchant_webhooks


        WHERE webhook_id = ?

        AND merchant_id = ?


        LIMIT 1

    `,



    // ======================================================
    // Update Webhook
    // ======================================================

    UPDATE_WEBHOOK: `

        UPDATE merchant_webhooks

        SET

            webhook_url = ?,

            events = ?,

            status = ?


        WHERE webhook_id = ?

        AND merchant_id = ?

    `,



    // ======================================================
    // Disable Webhook
    // ======================================================

    DELETE_WEBHOOK: `
    DELETE FROM merchant_webhooks
    WHERE webhook_id = ?
    AND merchant_id = ?
`,



    // ======================================================
    // Find Active Webhooks For Delivery
    // ======================================================

    GET_ACTIVE_WEBHOOKS_BY_EVENT: `
    SELECT
    webhook_id,
    merchant_id,
    webhook_url,
    webhook_secret,
    events,
    failure_count
FROM merchant_webhooks
WHERE merchant_id = ?
AND status = 'ACTIVE'
AND JSON_CONTAINS(
    events,
    ?
)

`,



    // ======================================================
    // Update Delivery Status
    // ======================================================

    UPDATE_WEBHOOK_DELIVERY_STATUS: `

        UPDATE merchant_webhooks

        SET

            last_triggered_at = NOW(),

            last_response_code = ?,

            failure_count = ?

        WHERE webhook_id = ?

    `



};


module.exports = WEBHOOK_QUERIES;
