const transactionWebhookService = require(
    "../../services/webhook/transactionWebhook.service"
);


const receiveTransactionWebhook = async (req, res, next) => {

    try {

        const result =
            await transactionWebhookService.processTransactionWebhook({

                merchantId:
                    req.merchantId,

                event:
                    req.webhookEvent,

                eventId:
                    req.webhookEventId,

                payload:
                    req.webhookPayload

            });


        return res.status(200).json({

            success: true,

            message:
                result.duplicate
                    ? "Transaction webhook already processed."
                    : "Transaction webhook processed successfully.",

            data: result

        });

    } catch (error) {

        return next(error);
    }
};


module.exports = {
    receiveTransactionWebhook
};