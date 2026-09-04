const express = require("express");
const path = require("path");
const fs = require("fs");

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
// Direct Report Download Route
// ======================================================

const cleanOldReports = () => {
    try {
        const dir = path.join(process.cwd(), "uploads", "reports", "admin");
        if (!fs.existsSync(dir)) return;
        const now = Date.now();
        const maxAge = 15 * 60 * 1000; // 15 minutes
        fs.readdirSync(dir).forEach((file) => {
            const fileFullPath = path.join(dir, file);
            try {
                const stats = fs.statSync(fileFullPath);
                if (now - stats.mtimeMs > maxAge) {
                    fs.unlinkSync(fileFullPath);
                }
            } catch {}
        });
    } catch {}
};

router.get(
    "/download/:fileName",
    (req, res) => {
        try {
            const fileName = path.basename(req.params.fileName);
            const filePath = path.join(process.cwd(), "uploads", "reports", "admin", fileName);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ success: false, message: "Report file not found or already downloaded." });
            }
            return res.download(filePath, fileName, (downloadErr) => {
                if (downloadErr) {
                    console.error("Report download stream error:", downloadErr);
                }
                // Automatically delete file immediately after client completes download
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr && unlinkErr.code !== "ENOENT") {
                        console.error("Failed to delete report file after download:", unlinkErr);
                    }
                });
                // Also clean up any lingering stale reports
                cleanOldReports();
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
);

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