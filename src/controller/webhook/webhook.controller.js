const {
    receiveWebhook
} = require(
    "../../services/webhook/receiveWebhook.service"
);


const receiveRazorpayWebhook = async (
    req,
    res,
    next
) => {

    try {

        const result =
            await receiveWebhook({

                webhookId:
                    req.params.webhookId,

                rawBody:
                    req.body,

                signature:
                    req.headers[
                        "x-razorpay-signature"
                    ],

                eventId:
                    req.headers[
                        "x-razorpay-event-id"
                    ]

            });


        return res.status(200).json({

            success: true,

            message:
                result.duplicate
                    ? "Webhook already received."
                    : "Webhook received successfully.",

            data: result

        });

    }
    catch (error) {

        next(error);

    }

};


module.exports = {

    receiveRazorpayWebhook

};