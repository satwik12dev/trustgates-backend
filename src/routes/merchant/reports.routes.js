const express = require("express");

const router = express.Router();


// ==========================================================
// Authentication Middleware
// ==========================================================

const authenticate =
    require(
        "../../middleware/auth.middleware"
    );


// ==========================================================
// Report Controller
// ==========================================================

const {
    getDaily,
    getMonthly
} = require(
    "../../controller/merchant/reports/reports.controller"
);

const {
    exportDaily,
    exportMonthly
} = require(
    "../../controller/merchant/reports/reports.export.controller"
);

// ==========================================================
// Daily Report
// ==========================================================

router.get(

    "/daily",

    authenticate,

    getDaily

);


// ==========================================================
// Monthly Report
// ==========================================================

router.get(

    "/monthly",

    authenticate,

    getMonthly

);

router.get(
    "/daily/export",
    authenticate,
    exportDaily
);

router.get(
    "/monthly/export",
    authenticate,
    exportMonthly
);

// ==========================================================
// Export
// ==========================================================

module.exports = router;