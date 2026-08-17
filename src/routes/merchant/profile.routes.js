const express = require("express");

const router = express.Router();

const {
    getProfile
} = require(
    "../../controller/merchant/profile/profile.controller"
);

const authenticateMerchant =
    require("../../middleware/auth.middleware");


router.get(
    "/profile",
    authenticateMerchant,
    getProfile
);

module.exports = router