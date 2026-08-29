const express = require("express");

const router = express.Router();

const verifyRazorpayTransactionWebhook = require(
    "../../middleware/webhook/razorpayTransactionWebhook.middleware"
);

const transactionWebhookController = require(
    "../../controller/webhook/transactionWebhook.controller"
);


// ==========================================================
// Razorpay Transaction Webhook
// ==========================================================

router.post(
    "/transaction/:merchantId",
    verifyRazorpayTransactionWebhook,
    transactionWebhookController.receiveTransactionWebhook
);


// ==========================================================
// Export
// ==========================================================

module.exports = router;