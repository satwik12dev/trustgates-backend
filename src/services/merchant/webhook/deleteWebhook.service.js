const WEBHOOK_QUERIES = require(
    "../../../queries/merchant/webhook/webhook.query"
);


const deleteWebhookService = async (
    connection,
    {
        merchantId,
        webhookId
    }
) => {

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
        WEBHOOK_QUERIES.DELETE_WEBHOOK,
        [
            webhookId,
            merchantId
        ]
    );

    return {
        webhookId,
        deleted: result.affectedRows > 0
    };
};

module.exports = deleteWebhookService;