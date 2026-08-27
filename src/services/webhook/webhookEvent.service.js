const WEBHOOK_EVENT_QUERIES = require(
    "../../queries/webhook/webhookEvent.query"
);

const {
    validateWebhookEvent
} = require(
    "../../validations/webhook/webhookEvent.validation"
);


const findWebhookEventById = async (
    connection,
    provider,
    eventId
) => {

    const [
        rows
    ] = await connection.query(

        WEBHOOK_EVENT_QUERIES
            .FIND_BY_PROVIDER_EVENT_ID,

        [
            provider,
            eventId
        ]

    );

    return rows.length
        ? rows[0]
        : null;

};


const createWebhookEvent = async (
    connection,
    {
        merchantId,
        provider,
        eventId,
        eventType,
        payload,
        signature
    }
) => {

    validateWebhookEvent({

        merchantId,

        provider,

        eventId,

        eventType,

        payload

    });


    const existingEvent =
        await findWebhookEventById(

            connection,

            provider,

            eventId

        );


    if (existingEvent) {

        return {

            duplicate: true,

            webhookEventId:
                existingEvent.webhook_event_id,

            processingStatus:
                existingEvent.processing_status

        };

    }


    const [
        result
    ] = await connection.query(

        WEBHOOK_EVENT_QUERIES
            .CREATE_EVENT,

        [

            merchantId,

            provider,

            eventId,

            eventType,

            JSON.stringify(payload),

            signature || null

        ]

    );


    return {

        duplicate: false,

        webhookEventId:
            result.insertId,

        processingStatus:
            "RECEIVED"

    };

};


const markWebhookEventProcessing = async (
    connection,
    webhookEventId
) => {

    const [
        result
    ] = await connection.query(

        WEBHOOK_EVENT_QUERIES
            .MARK_PROCESSING,

        [
            webhookEventId
        ]

    );


    return result.affectedRows === 1;

};


const markWebhookEventProcessed = async (
    connection,
    webhookEventId
) => {

    const [
        result
    ] = await connection.query(

        WEBHOOK_EVENT_QUERIES
            .MARK_PROCESSED,

        [
            webhookEventId
        ]

    );


    return result.affectedRows === 1;

};


const markWebhookEventFailed = async (
    connection,
    webhookEventId,
    errorMessage
) => {

    const [
        result
    ] = await connection.query(

        WEBHOOK_EVENT_QUERIES
            .MARK_FAILED,

        [
            errorMessage,
            webhookEventId
        ]

    );


    return result.affectedRows === 1;

};


module.exports = {

    findWebhookEventById,

    createWebhookEvent,

    markWebhookEventProcessing,

    markWebhookEventProcessed,

    markWebhookEventFailed

};