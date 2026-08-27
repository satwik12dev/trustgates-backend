const {
    processWebhookEvent
} = require(
    "../../services/webhook/processWebhookEvent.service"
);


const processWebhookEventController = async (
    req,
    res,
    next
) => {

    try {

        const result =
            await processWebhookEvent({

                provider:
                    req.params.provider,

                eventId:
                    req.params.eventId

            });


        return res.status(200).json({

            success: true,

            message:
                result.duplicate
                    ? "Webhook event already processed."
                    : "Webhook event processed successfully.",

            data: result

        });

    }
    catch (error) {

        next(error);

    }

};


module.exports = {

    processWebhookEventController

};