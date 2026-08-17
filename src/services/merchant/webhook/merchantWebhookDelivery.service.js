const axios = require("axios");
const crypto = require("crypto");
const WEBHOOK_QUERIES = require(
    "../../../queries/merchant/webhook/webhook.query"
);

const LOG_QUERIES = require(
    "../../../queries/merchant/webhook/merchantWebhookLogs.query"
);

const {
    generateWebhookSignature
} = require(
    "../../../utils/merchant/webhook/webhookSignature.util"
);

const {
    buildWebhookPayload
} = require(
    "../../../utils/merchant/webhook/webhookPayload.util"
);
const webhookRetryQueue = require(
    "../../../queues/webhook.retry.queue"
);

const merchantWebhookDeliveryService = async (
    connection,
    {
        merchantId,
        eventType,
        data
    }
) => {

    console.log("DELIVERY:", {
        merchantId,
        eventType
    });


    const [webhooks] = await connection.query(
        WEBHOOK_QUERIES.GET_ACTIVE_WEBHOOKS_BY_EVENT,
        [
            merchantId,
            JSON.stringify(eventType)
        ]
    );


    if (!webhooks.length) {
        return;
    }


    const payload = buildWebhookPayload(
        eventType,
        data
    );


    for (const webhook of webhooks) {

        let responseCode = null;
        let deliveryStatus = "FAILED";
        let retryCount = 0;
        const eventId = crypto.randomUUID();


        try {

            const signature = generateWebhookSignature(
                payload,
                webhook.webhook_secret
            );


            const response = await axios.post(
                webhook.webhook_url,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Webhook-Signature": signature
                    },
                    timeout: 10000
                }
            );


            responseCode = response.status;
            deliveryStatus = "SUCCESS";


        } catch (error) {

            responseCode =
                error.response?.status || null;

            deliveryStatus = "FAILED";

        }



        const [
            logResult
        ] = await connection.query(

            LOG_QUERIES.CREATE_WEBHOOK_LOG,

            [
                eventId,

                webhook.webhook_id,

                merchantId,

                eventType,

                JSON.stringify(payload),

                responseCode,

                deliveryStatus,

                0,

                deliveryStatus === "FAILED"
                    ? new Date(Date.now() + 60000)
                    : null,

                5,

                deliveryStatus === "FAILED"
                    ? "PENDING"
                    : "COMPLETED"
            ]

        );



        const logId = logResult.insertId;



        if (deliveryStatus === "FAILED") {

            await webhookRetryQueue.add(

                "retry-webhook",

                {
                    webhookLogId: logId
                },

                {

                    attempts: 5,

                    backoff: {
                        type: "exponential",
                        delay: 60000
                    },

                    removeOnComplete: true,

                    removeOnFail: false

                }

            );

        }



        const failureCount =
            deliveryStatus === "FAILED"
                ? webhook.failure_count + 1
                : 0;



        await connection.query(

            WEBHOOK_QUERIES.UPDATE_WEBHOOK_DELIVERY_STATUS,

            [

                responseCode,

                failureCount,

                webhook.webhook_id

            ]

        );

    }
};

module.exports = merchantWebhookDeliveryService;