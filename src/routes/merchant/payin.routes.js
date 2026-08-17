const express = require("express");

const router = express.Router();

const authenticate = require("../../middleware/apiAuthentication.middleware");

const {

    createOrder

} = require("../../controller/merchant/payin/createOrder.controller");

const {
    verifyPayment
} = require("../../controller/merchant/payin/verifyPayment.controller");

// ==========================================================
// Create Order
// ==========================================================

router.post(

    "/create-order",

    authenticate,

    createOrder

);

// ==========================================================
// Verify Payment
// ==========================================================

router.post(

    "/verify-payment",

    authenticate,

    verifyPayment

);

// ==========================================================
// Export
// ==========================================================

module.exports = router;