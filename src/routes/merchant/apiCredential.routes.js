const express = require("express");

const router = express.Router();

const {
    getApiCredentialsmerchant,
    updateApiStatusmerchant,
    regenerateApiCredentialsmerchant,
    revokeApiCredentialmerchant
} = require(
    "../../controller/merchant/apiCredential/apiCredential.controller"
);

const authenticateMerchant =
    require("../../middleware/auth.middleware");

const {
    checkDashboardAccess
} = require(
    "../../middleware/dashboardAccess.middleware"
);
const { merchantReadRateLimiter } = require("../../middleware/rateLimiter/merchant/merchantReadRateLimiter.middleware");
const { merchantActionRateLimiter } = require("../../middleware/rateLimiter/merchant/merchantActionRateLimiter.middleware");
const { merchantSensitiveRateLimiter } = require("../../middleware/rateLimiter/merchant/merchantSensitiveRateLimiter.middleware");


// ==========================================================
// Get Merchant API Credentials
// ==========================================================

router.get(

    "/",

    authenticateMerchant,

    checkDashboardAccess,

    merchantReadRateLimiter,

    getApiCredentialsmerchant

);


// ==========================================================
// Update API Status
// ==========================================================

router.patch(

    "/status/:credentialId",

    authenticateMerchant,

    checkDashboardAccess,

    merchantActionRateLimiter,

    updateApiStatusmerchant

);


// ==========================================================
// Regenerate API Credentials
// ==========================================================

router.post(

    "/regenerate/:credentialId",

    authenticateMerchant,

    checkDashboardAccess,

    merchantSensitiveRateLimiter,

    regenerateApiCredentialsmerchant

);


// ==========================================================
// Revoke API Credential
// ==========================================================

router.patch(

    "/revoke/:credentialId",

    authenticateMerchant,

    checkDashboardAccess,

    merchantSensitiveRateLimiter,

    revokeApiCredentialmerchant

);


module.exports = router;