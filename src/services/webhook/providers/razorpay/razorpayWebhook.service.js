const {
    RAZORPAY_EVENT_TYPE,
    WEBHOOK_EVENT_TYPE
} = require(
    "../../../../constants/webhook.constants"
);


const normalizeRazorpayWebhook = (
    payload
) => {

    if (
        !payload ||
        typeof payload !== "object"
    ) {

        throw new Error(
            "Invalid Razorpay webhook payload."
        );

    }


    const eventType =
        payload.event;


    if (!eventType) {

        throw new Error(
            "Razorpay webhook event type is missing."
        );

    }


    const entity =
        payload.payload;


    let normalizedEventType;


    switch (eventType) {

        case RAZORPAY_EVENT_TYPE.PAYMENT_CREATED:

            normalizedEventType =
                WEBHOOK_EVENT_TYPE.PAYMENT_CREATED;

            break;


        case RAZORPAY_EVENT_TYPE.PAYMENT_AUTHORIZED:

            normalizedEventType =
                WEBHOOK_EVENT_TYPE.PAYMENT_SUCCESS;

            break;


        case RAZORPAY_EVENT_TYPE.PAYMENT_CAPTURED:

            normalizedEventType =
                WEBHOOK_EVENT_TYPE.PAYMENT_SUCCESS;

            break;


        case RAZORPAY_EVENT_TYPE.PAYMENT_FAILED:

            normalizedEventType =
                WEBHOOK_EVENT_TYPE.PAYMENT_FAILED;

            break;


        case RAZORPAY_EVENT_TYPE.REFUND_CREATED:

            normalizedEventType =
                WEBHOOK_EVENT_TYPE.REFUND_CREATED;

            break;


        case RAZORPAY_EVENT_TYPE.REFUND_PROCESSED:

            normalizedEventType =
                WEBHOOK_EVENT_TYPE.REFUND_PROCESSED;

            break;


        case RAZORPAY_EVENT_TYPE.REFUND_FAILED:

            normalizedEventType =
                WEBHOOK_EVENT_TYPE.REFUND_FAILED;

            break;


        default:

            throw new Error(
                `Unsupported Razorpay webhook event: ${eventType}`
            );

    }


    return {

        provider:
            "RAZORPAY",

        providerEventType:
            eventType,

        normalizedEventType,

        payload

    };

};


module.exports = {

    normalizeRazorpayWebhook

};