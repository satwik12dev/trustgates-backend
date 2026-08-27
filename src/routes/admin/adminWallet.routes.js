const express = require("express");

const router = express.Router();

const {
    getAdminWalletAnalytics
} = require("../../controller/adminWallet/adminWallet.controller");

const adminAuth = require("../../middleware/authenticateAdmin")

// ==========================================================
// Admin Wallet Analytics
// ==========================================================

router.get(
    "/",
    adminAuth,
    getAdminWalletAnalytics
);


module.exports = router;