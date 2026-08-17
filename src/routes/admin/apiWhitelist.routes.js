const express = require("express");

const router = express.Router();

const {
    addIpToWhitelistMerchant,

    getWhitelistIpsMerchant,

    updateIpMerchant,

    updateIpStatusMerchant,

    deleteIpMerchant
} = require("../../controller/merchant/apiWhitelist/apiWhitelist.controller");

const authenticate = require("../../middleware/authenticateAdmin");

// ==========================================================
// Add IP To Whitelist
// ==========================================================
const authorizeAdmin = require("../../middleware/authorizeAdmin.middleware")

router.use(authorizeAdmin("ADMIN"));

router.post(
    "/:credentialId",
    authenticate,
    addIpToWhitelistMerchant
);

// ==========================================================
// Get All Whitelisted IPs
// ==========================================================

router.get(
    "/:credentialId",
    authenticate,
    getWhitelistIpsMerchant
);

// ==========================================================
// Update IP Address
// ==========================================================

router.put(
    "/:whitelistId",
    authenticate,
    updateIpMerchant
);

// ==========================================================
// Update IP Status
// ==========================================================

router.patch(
    "/status/:whitelistId",
    authenticate,
    updateIpStatusMerchant
);

// ==========================================================
// Delete IP Address
// ==========================================================

router.delete(
    "/delete/:whitelistId",
    authenticate,
    deleteIpMerchant
);

module.exports = router;