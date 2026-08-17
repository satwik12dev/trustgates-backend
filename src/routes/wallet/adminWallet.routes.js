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



const authenticateAdmin = require(
    "../../middleware/authenticateAdmin"
);



// ==================================================
// Admin Wallet Routes
// ==================================================


// Get Merchant Wallet

router.get(
    "/:merchantId",
    authenticateAdmin,
    getAdminWalletController
);

router.get(
    "/search",
    authenticateAdmin,
    searchWalletController
);

router.post(
    "/block",
    authenticateAdmin,
    blockWalletController
);

router.post(
    "/unblock",
    authenticateAdmin,
    unblockWalletController
);

router.post(
    "/adjust",
    authenticateAdmin,
    adjustWalletController
);

module.exports = router;