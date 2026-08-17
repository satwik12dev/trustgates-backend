const express = require("express");

const router = express.Router();


const authenticate = require(
    "../../middleware/auth.middleware"
);


// Controller

const {

    paymentHistory

} = require(
    "../../controller/merchant/payment/paymentHistory.controller"
);


// Validation

const paymentHistoryValidation = require(
    "../../validations/merchant/payment/paymentHistory.validation"
);



// ==========================================================
// Merchant Payment History
// ==========================================================

router.get(

    "/history",

    authenticate,

    paymentHistoryValidation,

    paymentHistory

);



module.exports = router;