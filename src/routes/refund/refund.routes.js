const express = require("express");

const router = express.Router();

const {
    getRefundStatusController
} = require(
    "../../controller/refund/status/getRefundStatus.controller"
);

router.get(
    "/status/:transactionRef",
    getRefundStatusController
);
module.exports = router;