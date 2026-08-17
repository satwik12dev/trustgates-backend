const express = require("express");

const router = express.Router();


// ==========================================================
// Authentication Middleware
// ==========================================================

const authenticate = require(
    "../../middleware/auth.middleware"
);


// ==========================================================
// Controllers
// ==========================================================

const {

    walletBalance

} = require(
    "../../controller/merchant/wallet/walletBalance.controller"
);



const {

    walletHistory

} = require(
    "../../controller/merchant/wallet/walletHistory.controller"
);



const {

    walletAnalytics

} = require(
    "../../controller/merchant/wallet/walletAnalytics.controller"
);



// ==========================================================
// Validations
// ==========================================================

const walletHistoryValidation = require(
    "../../validations/merchant/wallet/walletHistory.validation"
);


const walletAnalyticsValidation = require(
    "../../validations/merchant/wallet/walletAnalytics.validation"
);



// ==========================================================
// Wallet Balance
// ==========================================================

router.get(
    "/balance",
    authenticate,
    walletBalance
);



// ==========================================================
// Wallet History
// ==========================================================

router.get(
    "/history",
    authenticate,
    walletHistoryValidation,
    walletHistory
);



// ==========================================================
// Wallet Analytics
// ==========================================================

router.get(
    "/analytics",
    authenticate,
    walletAnalyticsValidation,
    walletAnalytics
);



module.exports = router;