const express = require("express");

const router = express.Router();

// ======================================================
// Middleware
// ======================================================

const authenticateAdmin = require("../../middleware/authenticateAdmin");
const authorizeAdmin = require("../../middleware/authorizeAdmin.middleware")


// ======================================================
// Daily Report Controller
// ======================================================

const {
    getDailyReport,
    getDailyTransactions,
    searchDailyTransactions,
    filterDailyTransactions,
    exportDailyReport
} = require("../../controller/admin/reports/dailyReport.controller");

// ======================================================
// Monthly Report Controller
// ======================================================

const {
    getMonthlyReport,
    getMonthlyDashboard,
    getTopMerchants,
    getMerchantPerformance,
    exportMonthlyReport
} = require("../../controller/admin/reports/monthlyReport.controller");

// ======================================================
// Merchant Report Controller
// ======================================================

const {
    getMerchantReport,
    getMerchantDashboard,
    getMerchantAnalytics,
    getMerchantRecentTransactions,
    exportMerchantReport
} = require("../../controller/admin/reports/merchantReport.controller");

// ======================================================
// Export Report Controller
// ======================================================

const {
    exportReportByType,
    getAvailableReportTypes,
    exportRefundReport,
    exportSettlementReport,
    exportChargebackReport
} = require("../../controller/admin/reports/exportReport.controller");

// ======================================================
// Authentication
// ======================================================

router.use(authenticateAdmin);
router.use(authorizeAdmin("ADMIN"));

// ======================================================
// Daily Reports
// ======================================================

router.get(
    "/daily",
    getDailyReport
);

router.get(
    "/daily/transactions",
    getDailyTransactions
);

router.get(
    "/daily/search",
    searchDailyTransactions
);

router.get(
    "/daily/filter",
    filterDailyTransactions
);

router.post(
    "/daily/export",
    exportDailyReport
);

// ======================================================
// Monthly Reports
// ======================================================

router.get(
    "/monthly",
    getMonthlyReport
);

router.get(
    "/monthly/dashboard",
    getMonthlyDashboard
);

router.get(
    "/monthly/top-merchants",
    getTopMerchants
);

router.get(
    "/monthly/merchant-performance",
    getMerchantPerformance
);

router.post(
    "/monthly/export",
    exportMonthlyReport
);

// ======================================================
// Merchant Reports
// ======================================================

router.get(
    "/merchant/:merchantId",
    getMerchantReport
);

router.get(
    "/merchant/:merchantId/dashboard",
    getMerchantDashboard
);

router.get(
    "/merchant/:merchantId/analytics",
    getMerchantAnalytics
);

router.get(
    "/merchant/:merchantId/transactions",
    getMerchantRecentTransactions
);

router.post(
    "/merchant/:merchantId/export",
    exportMerchantReport
);

// ======================================================
// Generic Export Reports
// ======================================================

router.get(
    "/export/types",
    getAvailableReportTypes
);

router.post(
    "/export",
    exportReportByType
);

router.post(
    "/export/refund",
    exportRefundReport
);

router.post(
    "/export/settlement",
    exportSettlementReport
);

router.post(
    "/export/chargeback",
    exportChargebackReport
);


module.exports = router;