const express =
    require("express");

const router =
    express.Router();


// ==========================================================
// Middleware
// ==========================================================

const authenticate =
    require(
        "../../middleware/auth.middleware"
    );

const {
    merchantReadRateLimiter
} =
    require(
        "../../middleware/rateLimiter/merchant/merchantReadRateLimiter.middleware"
    );


// ==========================================================
// Validation
// ==========================================================

const {
    validatePayinAnalytics
} =
    require(
        "../../validations/merchant/payin/payin.validation"
    );


// ==========================================================
// Controller
// ==========================================================

const {
    getPayinAnalyticsController
} =
    require(
        "../../controller/merchant/payin/payin.controller"
    );


// ==========================================================
// Merchant Payin Analytics
// ==========================================================

router.get(

    "/",

    authenticate,

    merchantReadRateLimiter,

    validatePayinAnalytics,

    getPayinAnalyticsController

);


module.exports =
    router;