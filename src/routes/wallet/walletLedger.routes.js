const express = require("express");

const router = express.Router();


const {

    getMerchantWalletLedgerController,

    getAdminWalletLedgerController

} = require(
    "../../controller/wallet/walletLedger.controller"
);



const authenticateMerchant = require(
    "../../middleware/auth.middleware"
);


const authenticateAdmin = require(
    "../../middleware/authenticateAdmin"
);



// ==================================================
// Merchant Ledger
// ==================================================

router.get(
    "/merchant",
    authenticateMerchant,
    getMerchantWalletLedgerController
);



// ==================================================
// Admin Ledger
// ==================================================

router.get(
    "/admin/:merchantId",
    authenticateAdmin,
    getAdminWalletLedgerController
);



module.exports = router;