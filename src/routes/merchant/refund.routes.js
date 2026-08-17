const express = require("express");

const router = express.Router();


// Middleware
const authenticate = require(
    "../../middleware/auth.middleware"
);


// Controllers
const {
    refundHistory
} = require(
    "../../controller/merchant/refund/refundHistory.controller"
);


const {
    refundAnalytics
} = require(
    "../../controller/merchant/refund/refundAnalytics.controller"
);


// Validations
const refundHistoryValidation = require(
    "../../validations/merchant/refund/refundHistory.validation"
);


const refundAnalyticsValidation = require(
    "../../validations/merchant/refund/refundAnalytics.validation"
);





// ==========================================================
// Refund History
// ==========================================================

router.get(

    "/history",
    authenticate,
    refundHistoryValidation,
    refundHistory

);



// ==========================================================
// Refund Analytics
// ==========================================================

router.get(
    "/analytics",
    authenticate,
    refundAnalyticsValidation,
    refundAnalytics
);



module.exports = router;