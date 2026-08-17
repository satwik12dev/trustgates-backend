const WEBHOOK_QUERIES = require(
    "../../../queries/merchant/webhook/webhook.query"
);


const getWebhookService = async (

    connection,

    merchantId

) => {


    const [webhooks] = await connection.query(

        WEBHOOK_QUERIES.GET_MERCHANT_WEBHOOKS,
        [merchantId]
    );


    return webhooks.map(webhook => ({

        webhookId: webhook.webhook_id,

        webhookUrl: webhook.webhook_url,

        events: typeof webhook.events === "string"
            ? JSON.parse(webhook.events)
            : webhook.events,

        status: webhook.status,

        failureCount: webhook.failure_count,

        lastTriggeredAt: webhook.last_triggered_at,

        lastResponseCode: webhook.last_response_code,

        createdAt: webhook.created_at,

        updatedAt: webhook.updated_at

    }));

};


module.exports = getWebhookService;