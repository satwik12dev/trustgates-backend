const express = require("express");

const router = express.Router();


// ==========================================================
// MIDDLEWARE
// ==========================================================

const authenticateAdmin =
    require("../../middleware/authenticateAdmin");

const authorizeAdmin =
    require("../../middleware/authorizeAdmin.middleware");

const uploadKYC =
    require("../../middleware/uploadKYC");


// ==========================================================
// RATE LIMITERS
// ==========================================================

const adminMerchantActionRateLimiter =
    require(
        "../../middleware/rateLimiter/admin/adminMerchantActionRateLimiter.middleware"
    );


// ==========================================================
// MERCHANT CONTROLLERS
// ==========================================================

const {
    createMerchantController,
    getMerchantListController,
    getMerchantByIdController,
    updateMerchantController,
    deleteMerchantController,
    uploadMerchantKycController,
    approveMerchantController,
    approveMerchantKycController,
    allowKycResubmissionController,
    generateApiCredentialsController,
    updateAccountStatusController
} = require(
    "../../controller/admin/merchant/merchant.controller"
);
const adminSensitiveActionRateLimiter = require("../../middleware/rateLimiter/admin/dminSensitiveActionRateLimiter.middleware");
const adminCriticalActionRateLimiter = require("../../middleware/rateLimiter/admin/adminCriticalActionRateLimiter.middleware");


// ==========================================================
// ADMIN AUTHENTICATION
// ==========================================================
//
// IMPORTANT:
//
// authenticateAdmin must run BEFORE authorizeAdmin
// because authorizeAdmin requires req.admin.
//
// ==========================================================

router.use(authenticateAdmin);

router.use(
    authorizeAdmin("ADMIN")
);


// ==========================================================
// CREATE MERCHANT
// ==========================================================

router.post(
    "/create-merchant",

    adminMerchantActionRateLimiter,

    createMerchantController
);


// ==========================================================
// GET MERCHANT LIST
// ==========================================================

router.get(
    "/get-merchant",

    getMerchantListController
);


// ==========================================================
// GET MERCHANT BY ID
// ==========================================================

router.get(
    "/get-merchant/:merchantId",

    getMerchantByIdController
);


// ==========================================================
// UPDATE MERCHANT
// ==========================================================

router.patch(
    "/update-merchant/:merchantId",
    adminMerchantActionRateLimiter,
    updateMerchantController
);


router.post(
    "/upload-merchant-kyc/:merchantId/kyc",
    adminMerchantActionRateLimiter,
    uploadKYC,
    uploadMerchantKycController
);

router.patch(
    "/update-merchant-status/:merchantId/account-status",
    adminMerchantActionRateLimiter,
    updateAccountStatusController
);

router.patch(
    "/verify-merchant-kyc/:merchantId/kyc",
    adminSensitiveActionRateLimiter,
    approveMerchantKycController
);


// ----------------------------------------------------------
// Allow KYC Resubmission
// ----------------------------------------------------------

router.patch(
    "/allow-kyc-resubmission/:merchantId/kyc",
    adminSensitiveActionRateLimiter,
    allowKycResubmissionController
);


// ==========================================================
// MERCHANT APPROVAL
// ==========================================================

router.patch(
    "/approve-merchant/:merchantId",
    adminSensitiveActionRateLimiter,
    approveMerchantController
);

router.post(
    "/generate-api-credentials/:merchantId",
    adminCriticalActionRateLimiter,
    generateApiCredentialsController
);

router.delete(
    "/delete-merchant/:merchantId",
    adminCriticalActionRateLimiter,
    deleteMerchantController
);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;