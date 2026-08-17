const express = require("express");

const router = express.Router();


const {

    getMerchantWalletController,

    getMerchantWalletSummaryController

} = require(
    "../../controller/wallet/merchantWallet.controller"
);


const authenticateMerchant = require(
    "../../middleware/auth.middleware"
);


router.get(
    "/",
    authenticateMerchant,
    getMerchantWalletController
);


router.get(
    "/summary",
    authenticateMerchant,
    getMerchantWalletSummaryController

);



module.exports = router;