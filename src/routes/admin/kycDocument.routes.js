const express = require("express");

const router = express.Router();

const {viewKycDocumentadmin} = require("../../controller/admin/kycDocument/kycDocument.controller");

const authenticateAdmin = require("../../middleware/authenticateAdmin");
const authorizeAdmin = require("../../middleware/authorizeAdmin.middleware");
const { getAllMerchantKyc, getMerchantKycById, getKycById } = require("../../controller/admin/kycVerify/getKyc.controller");

router.use(authorizeAdmin("ADMIN"));

// ==========================================================
// Get All Merchant KYC
// ==========================================================

router.get(
    "/",
    authenticateAdmin,
    getAllMerchantKyc
);


// ==========================================================
// Get KYC By Merchant ID
// ==========================================================

router.get(
    "/:merchantId",
    authenticateAdmin,
    getMerchantKycById
);

router.get(
    "/kyc/:kycId",
    authenticateAdmin,
    getKycById
);

router.get(
    "/:merchantId/:documentType",
    authenticateAdmin,
    viewKycDocumentadmin
);

module.exports = router;