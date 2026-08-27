const pool = require(
    "../../config/pool"
);

const WEBHOOK_QUERIES = require(
    "../../queries/webhook/webhook.query"
);

const {
    WEBHOOK_PROVIDER
} = require(
    "../../constants/webhook.constants"
);

const {
    validateWebhookId,
    validateProvider,
    validateWebhookSignature
} = require(
    "../../validations/webhook/webhook.validation"
);

const {
    verifyRazorpaySignature
} = require(
    "../../utils/webhook/providers/razorpay/razorpaySignature.util"
);

const {
    normalizeRazorpayWebhook
} = require(
    "./providers/razorpay/razorpayWebhook.service"
);

const {
    extractRazorpayEvent
} = require(
    "./providers/razorpay/razorpayEvent.service"
);

const {
    createWebhookEvent
} = require(
    "./webhookEvent.service"
);


const receiveWebhook = async ({
    webhookId,
    rawBody,
    signature,
    eventId
}) => {

    const connection =
        await pool.getConnection();

    try {

        // ==================================================
        // Validate Webhook Request
        // ==================================================

        const normalizedWebhookId =
            validateWebhookId(
                webhookId
            );


        validateWebhookSignature(
            signature
        );


        if (
            !Buffer.isBuffer(rawBody) ||
            rawBody.length === 0
        ) {

            throw new Error(
                "Webhook raw body is required."
            );

        }


        if (
            !eventId ||
            typeof eventId !== "string"
        ) {

            const error =
                new Error(
                    "Razorpay webhook event ID is required."
                );

            error.statusCode = 400;

            throw error;

        }


        // ==================================================
        // Get Webhook Configuration
        // ==================================================

        const [
            rows
        ] = await connection.query(

            WEBHOOK_QUERIES
                .GET_ACTIVE_WEBHOOK_WITH_PROVIDER,

            [
                normalizedWebhookId
            ]

        );


        if (
            !rows.length
        ) {

            const error =
                new Error(
                    "Active webhook configuration not found."
                );

            error.statusCode = 404;

            throw error;

        }


        const webhook =
            rows[0];


        // ==================================================
        // Validate Provider
        // ==================================================

        validateProvider(
            webhook.provider
        );


        if (
            webhook.provider !==
            WEBHOOK_PROVIDER.RAZORPAY
        ) {

            const error =
                new Error(
                    "Unsupported webhook provider."
                );

            error.statusCode = 400;

            throw error;

        }


        // ==================================================
        // Get Webhook Secret
        // ==================================================

        const webhookSecret =
            webhook.provider_webhook_secret ||
            webhook.webhook_secret;


        if (
            !webhookSecret
        ) {

            const error =
                new Error(
                    "Webhook secret is not configured."
                );

            error.statusCode = 500;

            throw error;

        }


        // ==================================================
        // Verify Razorpay Signature
        // ==================================================

        const isValid =
            verifyRazorpaySignature(

                rawBody,

                signature,

                webhookSecret

            );


        if (
            !isValid
        ) {

            const error =
                new Error(
                    "Invalid Razorpay webhook signature."
                );

            error.statusCode = 401;

            throw error;

        }


        // ==================================================
        // Parse Payload
        // ==================================================

        let payload;

        try {

            payload =
                JSON.parse(
                    rawBody.toString(
                        "utf8"
                    )
                );

        }
        catch {

            const error =
                new Error(
                    "Invalid webhook JSON payload."
                );

            error.statusCode = 400;

            throw error;

        }


        // ==================================================
        // Normalize Razorpay Event
        // ==================================================

        const normalized =
            normalizeRazorpayWebhook(
                payload
            );


        // ==================================================
        // Extract Razorpay Event
        // ==================================================

        const event =
            extractRazorpayEvent(
                payload,
                eventId
            );


        // ==================================================
        // Store Webhook Event
        // ==================================================

        const result =
            await createWebhookEvent(

                connection,

                {

                    merchantId:
                        webhook.merchant_id,

                    provider:
                        webhook.provider,

                    eventId:
                        event.eventId,

                    eventType:
                        event.eventType,

                    payload,

                    signature

                }

            );


        // ==================================================
        // Return
        // ==================================================

        return {

            success: true,

            duplicate:
                result.duplicate,

            webhookEventId:
                result.webhookEventId,

            merchantId:
                webhook.merchant_id,

            provider:
                webhook.provider,

            eventId:
                event.eventId,

            providerEventType:
                normalized.providerEventType,

            normalizedEventType:
                normalized.normalizedEventType,

            processingStatus:
                result.processingStatus || null

        };

    }
    finally {

        connection.release();

    }

};


module.exports = {

    receiveWebhook

};