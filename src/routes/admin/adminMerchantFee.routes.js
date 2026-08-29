// ==========================================================
// Admin Merchant Fee Management Routes
// ==========================================================

const express = require("express");

const router = express.Router();


// ==========================================================
// Middleware
// ==========================================================

const authAdmin =
    require("../../middleware/authenticateAdmin");


// ==========================================================
// Controller
// ==========================================================

const merchantFeeController =
    require("../../controller/adminFee/adminMerchantfee.controller");


// ==========================================================
// Admin Merchant Fee Management
// ==========================================================


// ----------------------------------------------------------
// Create Fee
// POST /admin/fee-management/
// ----------------------------------------------------------

router.post(
    "/",
    authAdmin,
    merchantFeeController.createMerchantFee
);


// ----------------------------------------------------------
// Get All Fees
// GET /admin/fee-management/
// ----------------------------------------------------------

router.get(
    "/",
    authAdmin,
    merchantFeeController.getAllMerchantFees
);


// ----------------------------------------------------------
// Get All Fees Of Merchant
// GET /admin/fee-management/merchant/:merchantId
// ----------------------------------------------------------

router.get(
    "/merchant/:merchantId",
    authAdmin,
    merchantFeeController.getMerchantFees
);


// ----------------------------------------------------------
// Get Currently Active Fee
// GET /admin/fee-management/merchant/:merchantId/:paymentMethod/active
// ----------------------------------------------------------

router.get(
    "/merchant/:merchantId/:paymentMethod/active",
    authAdmin,
    merchantFeeController.getActiveMerchantFee
);


// ----------------------------------------------------------
// Get Fee By Merchant + Payment Method
// GET /admin/fee-management/merchant/:merchantId/:paymentMethod
// ----------------------------------------------------------

router.get(
    "/merchant/:merchantId/:paymentMethod",
    authAdmin,
    merchantFeeController.getMerchantFeeByMethod
);


// ----------------------------------------------------------
// Get Fee By ID
// GET /admin/fee-management/:feeId
// ----------------------------------------------------------

router.get(
    "/:feeId",
    authAdmin,
    merchantFeeController.getMerchantFeeById
);


// ----------------------------------------------------------
// Update Fee
// PUT /admin/fee-management/:feeId
// ----------------------------------------------------------

router.put(
    "/:feeId",
    authAdmin,
    merchantFeeController.updateMerchantFee
);


// ----------------------------------------------------------
// Update Fee Status
// PATCH /admin/fee-management/:feeId/status
// ----------------------------------------------------------

router.patch(
    "/:feeId/status",
    authAdmin,
    merchantFeeController.updateMerchantFeeStatus
);


// ----------------------------------------------------------
// Delete Fee
// DELETE /admin/fee-management/:feeId
// ----------------------------------------------------------

router.delete(
    "/:feeId",
    authAdmin,
    merchantFeeController.deleteMerchantFee
);


// ==========================================================
// Export
// ==========================================================

module.exports = router;