const express = require("express");

const router = express.Router();

const {
    addIpToWhitelistMerchant,
    getWhitelistIpsMerchant,
    updateIpMerchant,
    updateIpStatusMerchant,
    deleteIpMerchant
} = require(
    "../../controller/merchant/apiWhitelist/apiWhitelist.controller"
);

const authenticateMerchant =
    require("../../middleware/auth.middleware");

const {
    checkDashboardAccess
} = require(
    "../../middleware/dashboardAccess.middleware"
);


// ==========================================================
// Add IP
// ==========================================================

router.post(

    "/:credentialId",

    authenticateMerchant,

    checkDashboardAccess,

    addIpToWhitelistMerchant

);


// ==========================================================
// Get IPs
// ==========================================================

router.get(

    "/:credentialId",

    authenticateMerchant,

    checkDashboardAccess,

    getWhitelistIpsMerchant

);


// ==========================================================
// Update IP
// ==========================================================

router.patch(

    "/ip/:whitelistId",

    authenticateMerchant,

    checkDashboardAccess,

    updateIpMerchant

);


// ==========================================================
// Update IP Status
// ==========================================================

router.patch(

    "/status/:whitelistId",

    authenticateMerchant,

    checkDashboardAccess,

    updateIpStatusMerchant

);


// ==========================================================
// Delete IP
// ==========================================================

router.delete(

    "/:whitelistId",

    authenticateMerchant,

    checkDashboardAccess,

    deleteIpMerchant

);


module.exports = router;