const express = require("express");

const router = express.Router();

const authenticate = require("../../middleware/auth.middleware");

const {
    validatePayoutAnalytics
} = require("../../validations/merchant/payout/payout.validation");

const {
    getPayoutAnalyticsController
} = require("../../controller/merchant/payout/payout.controller");


// ==========================================
// Merchant Payout Analytics
// ==========================================

router.get(
    "/",
    authenticate,
    validatePayoutAnalytics,
    getPayoutAnalyticsController
);


module.exports = router;