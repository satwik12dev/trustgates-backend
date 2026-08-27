const WEBHOOK_EVENT_QUERIES = {

    // ==================================================
    // Find Event By Provider + Event ID
    // ==================================================

    FIND_BY_PROVIDER_EVENT_ID: `

        SELECT

            webhook_event_id,
            merchant_id,
            provider,
            event_id,
            event_type,
            payload,
            signature,
            processing_status,
            processing_attempts,
            error_message,
            received_at,
            processed_at

        FROM webhook_events

        WHERE provider = ?

          AND event_id = ?

        LIMIT 1

    `,


    // ==================================================
    // Get Event For Processing
    // ==================================================

    GET_EVENT_FOR_PROCESSING: `

        SELECT

            webhook_event_id,
            merchant_id,
            provider,
            event_id,
            event_type,
            payload,
            signature,
            processing_status,
            processing_attempts,
            error_message,
            received_at,
            processed_at

        FROM webhook_events

        WHERE provider = ?

          AND event_id = ?

        LIMIT 1

        FOR UPDATE

    `,


    // ==================================================
    // Create Event
    // ==================================================

    CREATE_EVENT: `

        INSERT INTO webhook_events
        (
            merchant_id,
            provider,
            event_id,
            event_type,
            payload,
            signature,
            processing_status
        )

        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'RECEIVED'
        )

    `,


    // ==================================================
    // Mark Processing
    // ==================================================

    MARK_PROCESSING: `

        UPDATE webhook_events

        SET

            processing_status = 'PROCESSING',

            processing_attempts =
                processing_attempts + 1,

            updated_at = NOW()

        WHERE webhook_event_id = ?

          AND processing_status = 'RECEIVED'

    `,


    // ==================================================
    // Mark Processed
    // ==================================================

    MARK_PROCESSED: `

        UPDATE webhook_events

        SET

            processing_status = 'PROCESSED',

            processed_at = NOW(),

            error_message = NULL,

            updated_at = NOW()

        WHERE webhook_event_id = ?

    `,


    // ==================================================
    // Mark Failed
    // ==================================================

    MARK_FAILED: `

        UPDATE webhook_events

        SET

            processing_status = 'FAILED',

            error_message = ?,

            updated_at = NOW()

        WHERE webhook_event_id = ?

    `

};


module.exports = WEBHOOK_EVENT_QUERIES;