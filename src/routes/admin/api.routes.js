const express = require("express");

const router = express.Router();


const {
    createApiCredentials,

    getApiCredentialsController,

    updateApiCredentialStatus,

    regenerateApiCredentialsController,

    revokeApiCredentialController
} = require("../../controller/admin/apiCredentials/apiCredential.controller")

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const authorizeAdmin = require("../../middleware/authorizeAdmin.middleware");

const adminSensitiveActionRateLimiter = require("../../middleware/rateLimiter/admin/dminSensitiveActionRateLimiter.middleware");

const adminCriticalActionRateLimiter = require("../../middleware/rateLimiter/admin/adminCriticalActionRateLimiter.middleware");


// ==========================================================
// Admin Authentication + Authorization
// ==========================================================

router.use(authenticateAdmin);

router.use(
    authorizeAdmin("ADMIN")
);


// ==========================================================
// Generate API Credentials
// ==========================================================

router.post(
    "/generate/:merchantId",
    adminSensitiveActionRateLimiter,
    createApiCredentials
);


// ==========================================================
// Get Merchant API Credentials
// ==========================================================

router.get(
    "/:merchantId",
    getApiCredentialsController
);


// ==========================================================
// Update API Credential Status
// ==========================================================

router.patch(
    "/status/:credentialId",
    adminSensitiveActionRateLimiter,
    updateApiCredentialStatus
);


// ==========================================================
// Regenerate API Credentials
// ==========================================================

router.post(
    "/regenerate/:credentialId",
    adminCriticalActionRateLimiter,
    regenerateApiCredentialsController
);


// ==========================================================
// Revoke API Credential
// ==========================================================

router.post(
    "/revoke/:credentialId",
    adminCriticalActionRateLimiter,
    revokeApiCredentialController
);


module.exports = router;