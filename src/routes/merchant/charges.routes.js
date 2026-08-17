const express = require("express");

const router = express.Router();

const authenticate = require("../../middleware/auth.middleware")

const {
    getMerchantFees
} = require(
    "../../controller/merchant/charges/charges.controller"
);

router.get(
    "/fees",
    authenticate,
    getMerchantFees
);

module.exports=router;