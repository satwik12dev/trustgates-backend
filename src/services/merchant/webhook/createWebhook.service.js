const WEBHOOK_QUERIES = require(
    "../../../queries/merchant/webhook/webhook.query"
);

const generateWebhookSecret = require(
    "../../../utils/merchant/webhook/webhookSecret.util"
);

const {
    validateCreateWebhook
} = require(
    "../../../validations/merchant/webhook/createWebhook.validation"
);

const {
    ConflictError
} = require(
    "../../../utils/errors"
);


const createWebhookService = async (
    connection,
    {
        merchantId,
        webhookUrl,
        events
    }
) => {

    validateCreateWebhook({
        webhookUrl,
        events
    });


    const [existing] = await connection.query(
        `
        SELECT webhook_id
        FROM merchant_webhooks
        WHERE merchant_id = ?
        AND webhook_url = ?
        LIMIT 1
        `,
        [
            merchantId,
            webhookUrl
        ]
    );


    if(existing.length){
        throw new ConflictError(
            "Webhook already exists."
        );
    }


    const webhookSecret = generateWebhookSecret();


    const [result] = await connection.query(
        WEBHOOK_QUERIES.CREATE_WEBHOOK,
        [
            merchantId,
            webhookUrl,
            webhookSecret,
            JSON.stringify(events),
            "ACTIVE"
        ]
    );


    return {
        webhookId: result.insertId,
        webhookUrl,
        events,
        status: "ACTIVE",
        webhookSecret
    };

};


module.exports = createWebhookService;