const express = require("express");

const router = express.Router();

const {
    receiveRazorpayWebhook
} = require(
    "../../controller/webhook/webhook.controller"
);


const {
    processWebhookEventController
} = require(
    "../../controller/webhook/processWebhookEvent.controller"
);

router.post(
    "/razorpay/:webhookId",
    express.raw({
        type: "application/json"
    }),
    receiveRazorpayWebhook
);



router.post(
    "/process/:provider/:eventId",
    processWebhookEventController
);
module.exports = router;