const {
    WEBHOOK_PROVIDER,
    WEBHOOK_STATUS,
    WEBHOOK_PROCESSING_STATUS
} = require(
    "../../constants/webhook.constants"
);


const validateWebhookId = (
    webhookId
) => {

    if (
        !webhookId ||
        !Number.isInteger(
            Number(webhookId)
        ) ||
        Number(webhookId) <= 0
    ) {

        throw new Error(
            "Invalid webhook ID."
        );

    }

    return Number(webhookId);

};


const validateMerchantId = (
    merchantId
) => {

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

    return Number(merchantId);

};


const validateProvider = (
    provider
) => {

    if (
        !Object.values(
            WEBHOOK_PROVIDER
        ).includes(provider)
    ) {

        throw new Error(
            "Invalid webhook provider."
        );

    }

    return provider;

};


const validateWebhookStatus = (
    status
) => {

    if (
        !Object.values(
            WEBHOOK_STATUS
        ).includes(status)
    ) {

        throw new Error(
            "Invalid webhook status."
        );

    }

    return status;

};


const validateProcessingStatus = (
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


const validateWebhookSecret = (
    webhookSecret
) => {

    if (
        !webhookSecret ||
        typeof webhookSecret !== "string"
    ) {

        throw new Error(
            "Webhook secret is required."
        );

    }

    return webhookSecret;

};


const validateWebhookSignature = (
    signature
) => {

    if (
        !signature ||
        typeof signature !== "string"
    ) {

        throw new Error(
            "Webhook signature is required."
        );

    }

    return signature;

};


const validateWebhookPayload = (
    payload
) => {

    if (
        !payload ||
        typeof payload !== "object"
    ) {

        throw new Error(
            "Invalid webhook payload."
        );

    }

    return payload;

};


const validateEventId = (
    eventId
) => {

    if (
        !eventId ||
        typeof eventId !== "string"
    ) {

        throw new Error(
            "Webhook event ID is required."
        );

    }

    return eventId;

};


const validateEventType = (
    eventType
) => {

    if (
        !eventType ||
        typeof eventType !== "string"
    ) {

        throw new Error(
            "Webhook event type is required."
        );

    }

    return eventType;

};


module.exports = {

    validateWebhookId,

    validateMerchantId,

    validateProvider,

    validateWebhookStatus,

    validateProcessingStatus,

    validateWebhookSecret,

    validateWebhookSignature,

    validateWebhookPayload,

    validateEventId,

    validateEventType

};