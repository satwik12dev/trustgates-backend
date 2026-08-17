const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/auth.middleware");

const createWebhook = require("../../controller/merchant/webhook/createWebhook.controller");

const getWebhook = require("../../controller/merchant/webhook/getWebhook.controller");

const updateWebhook = require("../../controller/merchant/webhook/updateWebhook.controller");

const deleteWebhook = require("../../controller/merchant/webhook/deleteWebhook.controller");

const retryWebhook = require("../../controller/merchant/webhook/retryWebhook.controller")

const merchantWebhookLogs = require("../../controller/merchant/webhook/merchantWebhookLogs.controller");

// Create Webhook
router.post("/create-webhook",authenticate,createWebhook);

// Get Webhooks
router.get("/get-webhook",authenticate,getWebhook);

// Update Webhook
router.patch("/update-webhook/:id",authenticate,updateWebhook);

// Disable Webhook
router.delete("/delete-webhook/:id",authenticate,deleteWebhook);


// Webhook Logs
router.get("/logs",authenticate,merchantWebhookLogs);

// Retry Webhook
router.post("/retry/:logId",authenticate,retryWebhook);

module.exports = router;