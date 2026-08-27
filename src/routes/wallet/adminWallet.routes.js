const express = require("express");

const router = express.Router();

const {
    getAdminWalletController,
    searchWalletController,
    blockWalletController,
    unblockWalletController,
    adjustWalletController
} = require(
    "../../controller/wallet/adminWallet.controller"
);

const {
    getAdminWalletAnalytics
} = require("../../controller/adminWallet/adminWallet.controller")

const authenticateAdmin = require(
    "../../middleware/authenticateAdmin"
);


// ==================================================
// Admin Wallet Analytics
// ==================================================

router.get(
    "/details",
    authenticateAdmin,
    getAdminWalletAnalytics
);


// ==================================================
// Search Merchant Wallet
// ==================================================

router.get(
    "/search",
    authenticateAdmin,
    searchWalletController
);


// ==================================================
// Get Merchant Wallet
// ==================================================

router.get(
    "/:merchantId",
    authenticateAdmin,
    getAdminWalletController
);


// ==================================================
// Block Wallet
// ==================================================

router.post(
    "/block",
    authenticateAdmin,
    blockWalletController
);


// ==================================================
// Unblock Wallet
// ==================================================

router.post(
    "/unblock",
    authenticateAdmin,
    unblockWalletController
);


// ==================================================
// Adjust Wallet
// ==================================================

router.post(
    "/adjust",
    authenticateAdmin,
    adjustWalletController
);


module.exports = router;