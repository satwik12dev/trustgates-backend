const express = require("express");

const router = express.Router();


const {

    retryRefundController

} = require("../../controller/refund/processor/retryRefund.controller")


const {

    syncRefundController

} = require("../../controller/refund/processor/syncRefund.controller")
const authenticateAdmin = require("../../middleware/auth.middleware")

// ==========================================================
// Retry Refund
// ==========================================================

router.post(
    "/retry/:refundId",
    authenticateAdmin,
    retryRefundController
);


// ==========================================================
// Sync Refund
// ==========================================================

router.post(
    "/sync",
    authenticateAdmin,
    syncRefundController
);

module.exports = router;