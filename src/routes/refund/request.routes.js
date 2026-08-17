const express = require("express");

const router = express.Router();


const {

    createRefundRequestController

} = require("../../controller/refund/request/createRefundRequest.controller");


const {

    getRefundRequestController

} = require("../../controller/refund/request/getRefundRequest.controller");


const {

    listRefundRequestsController

} = require("../../controller/refund/request/listRefundRequests.controller");


const {

    approveRefundRequestController

} = require("../../controller/refund/request/approveRefundRequest.controller");



const {

    rejectRefundRequestController

} = require("../../controller/refund/request/rejectRefundRequest.controller");



const {

    cancelRefundRequestController

} = require("../../controller/refund/request/cancelRefundRequest.controller");

const authenticate = require("../../middleware/auth.middleware")
const authenticateAdmin = require("../../middleware/apiAuthentication.middleware")

// ==========================================================
// Merchant Refund Request
// ==========================================================

router.post(
    "/request",
    authenticateAdmin,
    createRefundRequestController
);


router.get(
    "/request/:requestId",
    authenticateAdmin,
    getRefundRequestController
);


router.get(
    "/requests",
    authenticateAdmin,
    listRefundRequestsController
);


// ==========================================================
// Admin Refund Actions
// ==========================================================

router.patch(
    "/request/:requestId/approve",
    authenticate,
    approveRefundRequestController
);

router.patch(
    "/request/:requestId/reject",
    authenticate,
    rejectRefundRequestController
);

router.patch(
    "/request/:requestId/cancel",
    authenticate,
    cancelRefundRequestController
);

module.exports = router;