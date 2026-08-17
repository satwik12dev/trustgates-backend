const express = require("express");

const router = express.Router();

const {

    razorpayWebhook

} = require("../../controller/webhook/razorpayWebhook.controller");

const {

    refundWebhookController

} = require("../../controller/refund/webhook/webhookRefund.controller");



// ==========================================================
// Razorpay Webhook
// ==========================================================

router.post(
    "/razorpay",
    express.raw({
        type: "application/json"
    }),
    razorpayWebhook
);

// ==========================================================
// Razorpay Refund Webhook
// ==========================================================

router.post(
    "/razorpay/refund",
    express.raw({ type: "application/json" }),
    refundWebhookController
);
// ==========================================================
// Export
// ==========================================================

module.exports = router;