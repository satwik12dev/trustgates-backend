const WEBHOOK_QUERIES = require(
    "../../../queries/merchant/webhook/webhook.query"
);

const {
    validateUpdateWebhook
} = require(
    "../../../validations/merchant/webhook/updateWebhook.validation"
);


const updateWebhookService = async (
    connection,
    {
        merchantId,
        webhookId,
        webhookUrl,
        events,
        status
    }
) => {


    validateUpdateWebhook({
        webhookUrl,
        events,
        status
    });

    const [existing] = await connection.query(
        WEBHOOK_QUERIES.GET_WEBHOOK_BY_ID,
        [
            webhookId,
            merchantId
        ]
    );

    if(!existing.length){
        throw new Error(
            "Webhook not found."
        );
    }
    const [result] = await connection.query(
        WEBHOOK_QUERIES.UPDATE_WEBHOOK,
        [
            webhookUrl ?? existing[0].webhook_url,
            JSON.stringify(events ?? existing[0].events),
            status ?? existing[0].status,
            webhookId,
            merchantId
        ]
    );

    return {
        webhookId,
        updated: result.affectedRows > 0
    };
};


module.exports = updateWebhookService;