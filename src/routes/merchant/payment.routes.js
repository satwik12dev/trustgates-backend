const express = require("express");

const router = express.Router();


// Middleware
const authenticate = require(
    "../../middleware/apiAuthentication.middleware"
);


// Controller

const {
    paymentStatus
} = require(
    "../../controller/merchant/payment/paymentStatus.controller"
);


// Validation

const paymentStatusValidation = require(
    "../../validations/merchant/payment/paymentStatus.validation"
);


// ==========================================================
// Payment Status
// ==========================================================

router.get(
    "/status/:transactionRef",
    authenticate,
    paymentStatusValidation,
    paymentStatus
);



module.exports = router;