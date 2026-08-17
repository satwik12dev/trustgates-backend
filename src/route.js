require("dotenv").config();

const express = require("express");
const route = express();

const cors = require("cors");
const helmet = require("helmet");

// const webhookRoutes = require("./routes/webhook/webhook.routes");
const auditContext = require("./middleware/auditContext.middleware");
const requestIdMiddleware = require("./middleware/requestId.middleware.jsrequestId.middleware");


route.set("trust proxy", 1);
route.use(helmet({
        contentTypeOptions: true,

        frameguard: {
            action: "sameorigin"
        },

        referrerPolicy: {
            policy: "strict-origin-when-cross-origin"
        },

        xssFilter: false
    })
);

const allowedOrigin = process.env.FRONTEND_URL?.trim();

route.use(cors({
        origin: (origin, callback) => {

            // Postman / server-to-server
            if (!origin) {
                return callback(null, true);
            }

            if (origin === allowedOrigin) {
                return callback(null, true);
            }

            return callback(
                new Error(
                    "CORS origin not allowed."
                )
            );
        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Request-ID"
        ],

        exposedHeaders: [
            "X-RateLimit-Limit",
            "X-RateLimit-Remaining",
            "Retry-After"
        ]
    })
);

route.use(auditContext);
route.use(requestIdMiddleware);
// Webhook FIRST
// route.use("/webhook", webhookRoutes);

const { globalRateLimiter }= require("./middleware/rateLimiter/merchant/rateLimiter.middleware")

const { ipCheckMiddleware, apiRateLimiter } = require("./middleware/rateLimiter");
const notFoundMiddleware = require("./middleware/notFound.middleware")
const errorHandler = require("./middleware/error.middleware")


// ==========================================
// IP Blocking & Rate Limiting Middleware
// ==========================================
// 1. Rejects blocked IPs before processing any route
route.use(ipCheckMiddleware);
route.use(globalRateLimiter)
// 2. Applies Universal Rate Limiter to EVERY API request & blocks IP if breached
// route.use(apiRateLimiter);
route.use(
    express.json({
        limit: "1mb"
    })
);

route.use(
    express.urlencoded({
        extended: false,
        limit: "1mb"
    })
);

const adminDashboardRoutes = require("./routes/admin/dashboard.routes");
const adminMerchantDashboardRoutes = require("./routes/admin/merchant.routes")
const adminReport = require('./routes/admin/report.routes')
const adminAPI = require('./routes/admin/api.routes')
const adminviewKyc = require("./routes/admin/kycDocument.routes")

const merchantDashboardRoutes = require("./routes/merchant/dashboard.routes")
const merchantapiWhitelist = require("./routes/merchant/apiWhitelist.routes")
const merchantApiCredential = require("./routes/merchant/apiCredential.routes")
// const merchantCreateOrderPayin = require("./routes/merchant/payin.routes");
const merchantRefundAnalytics = require("./routes/merchant/refund.routes")
const walletAnalytics = require("./routes/merchant/wallet.routes")
const payHistory = require("./routes/merchant/paymentHistory.routes")
const merchantWebhook = require("./routes/merchant/webhook.routes")
const merchantReports = require("./routes/merchant/reports.routes")
const merchantCharges = require("./routes/merchant/charges.routes")
const merchantPayinAnalytics = require("./routes/merchant/payinAnalytics.routes")
const merchantPayoutAnalytics = require("./routes/merchant/payoutAnalytics.routes")
const merchanProfile = require("./routes/merchant/profile.routes")

// const paymentStatusRoutes = require("./routes/merchant/payment.routes")
// const refundRequestRoutes = require("./routes/refund/request.routes");
// const refundProcessorRoutes = require("./routes/refund/processor.routes");
// const refundrola = require("./routes/refund/refund.routes");


const merchantWalletRoutes = require("./routes/wallet/merchantWallet.routes");
const adminWalletRoutes = require("./routes/wallet/adminWallet.routes");
const walletLedgerRoutes = require("./routes/wallet/walletLedger.routes");



// Admin Dashboard APIs
route.use("/admin", adminDashboardRoutes);
route.use("/admin/merchant", adminMerchantDashboardRoutes)
route.use("/admin/report", adminReport)
route.use("/admin/api", adminAPI)
route.use("/admin/api-whitelist", merchantapiWhitelist)
route.use("/admin/view-kyc", adminviewKyc)
route.use("/admin/wallet",adminWalletRoutes);


//Merchant Dashbiard APIs
route.use("/merchant", merchantDashboardRoutes)
route.use("/merchant", merchanProfile)
route.use("/merchant/api-whitelist",merchantapiWhitelist )
route.use("/merchant/api-credentials", merchantApiCredential)
// route.use("/merchant/payin", merchantCreateOrderPayin)
route.use("/merchant/refund", merchantRefundAnalytics)
route.use("/merchant/wallet-analytics", walletAnalytics)
route.use("/merchant/payment",payHistory)
route.use("/merchant/webhook", merchantWebhook)
route.use("/merchant/reports", merchantReports)
route.use("/merchant", merchantCharges)
route.use("/merchant/payin/analytics", merchantPayinAnalytics)
route.use("/merchant/payout/analytics", merchantPayoutAnalytics)

route.use("/wallet",merchantWalletRoutes);

// route.use("/api/refund", refundRequestRoutes)
// route.use("/api/refund/processor", refundProcessorRoutes)
// route.use("/api/v1/refund",refundrola);

route.use("/wallet/ledger",walletLedgerRoutes);

// Centralized Error Handling Middleware
route.use(notFoundMiddleware);
route.use(errorHandler);

module.exports = route;