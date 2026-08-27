const {
    WEBHOOK_PROVIDER,
    WEBHOOK_EVENT_TYPE,
    WEBHOOK_PROCESSING_STATUS
} = require(
    "../../constants/webhook.constants"
);


const validateWebhookEvent = ({
    merchantId,
    provider,
    eventId,
    eventType,
    payload
}) => {

    if (
        !merchantId ||
        !Number.isInteger(
            Number(merchantId)
        ) ||
        Number(merchantId) <= 0
    ) {

        throw new Error(
            "Invalid merchant ID."
        );

    }


    if (
        !Object.values(
            WEBHOOK_PROVIDER
        ).includes(provider)
    ) {

        throw new Error(
            "Invalid webhook provider."
        );

    }


    if (
        !eventId ||
        typeof eventId !== "string" ||
        eventId.length > 150
    ) {

        throw new Error(
            "Invalid webhook event ID."
        );

    }


    if (
        !eventType ||
        typeof eventType !== "string" ||
        eventType.length > 100
    ) {

        throw new Error(
            "Invalid webhook event type."
        );

    }


    if (
        !payload ||
        typeof payload !== "object" ||
        Array.isArray(payload)
    ) {

        throw new Error(
            "Invalid webhook payload."
        );

    }


    return true;

};


const validateEventProcessingStatus = (
    status
) => {

    if (
        !Object.values(
            WEBHOOK_PROCESSING_STATUS
        ).includes(status)
    ) {

        throw new Error(
            "Invalid webhook processing status."
        );

    }

    return status;

};


const validateNormalizedEventType = (
    eventType
) => {

    if (
        !Object.values(
            WEBHOOK_EVENT_TYPE
        ).includes(eventType)
    ) {

        throw new Error(
            "Invalid normalized webhook event type."
        );

    }

    return eventType;

};


module.exports = {

    validateWebhookEvent,

    validateEventProcessingStatus,

    validateNormalizedEventType

};