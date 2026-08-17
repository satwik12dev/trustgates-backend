const express = require("express");
const route = express.Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");


const adminlogin = require("../../controller/admin/auth/login.controller")
const {adminlogout,logoutAllController} = require("../../controller/admin/auth/logout.controller")

const changePasswordController =require("../../controller/admin/auth/changePassword.controller");


const verifyKyc = require("../../controller/admin/kycVerify/verifyKyc.controller")

const {
    dashboardOverview,
    summaryCards,
    recentTransactions,
    transactionVolume,
    successRate,
    paymentMethodAnalytics,
    transactionStatusAnalytics,
    topMerchants,
    transactionDetails
} = require(
    "../../controller/admin/dashboard/dashboard.controller"
);

const{
    dashboardAnalytics,
    transactionTrend,
    revenueTrend,
    paymentMethodDistribution,
    paymentProviderDistribution,
    merchantPerformance,
    hourlyTransactions,
    currencyAnalytics,
    statusAnalytics
}= require("../../controller/admin/dashboard/analytics.controller")
const {
    transactionList,
    latestTransactions,
    dashboardTransactions
} = require("../../controller/admin/dashboard/dashboard.controller");

const {
    refundDashboard,
    refundSummary,
    recentRefunds,
    refundAnalytics,
    merchantRefundAnalytics,
    refundStatusAnalytics
} = require("../../controller/admin/dashboard/refund.controller");

const {
    walletDashboard,
    walletSummary,
    recentWalletTransactions,
    walletAnalytics,
    walletStatusAnalytics,
    topWallets
} = require("../../controller/admin/dashboard/wallet.controller");

const {
    upiDashboard,
    upiSummary,
    recentUpiTransactions,
    upiAnalytics,
    bankAnalytics,
    merchantUpiAnalytics,
    upiVerificationAnalytics
} = require("../../controller/admin/dashboard/upi.controller");

const {
    cardDashboard,
    cardSummary,
    recentCardTransactions,
    cardNetworkAnalytics,
    cardTypeAnalytics,
    issuingBankAnalytics,
    merchantCardAnalytics,
    cardCountryAnalytics
} = require("../../controller/admin/dashboard/card.controller");

const {
    netBankingDashboard,
    netBankingSummary,
    recentNetBankingTransactions,
    netBankBankAnalytics,
    accountTypeAnalytics,
    netBankingStatusAnalytics,
    merchantNetBankingAnalytics,
    bankCodeAnalytics
} = require("../../controller/admin/dashboard/netbanking.controller");

const {
    emiDashboard,
    emiSummary,
    recentEmiTransactions,
    emiBankAnalytics,
    emiCardNetworkAnalytics,
    emiTenureAnalytics,
    merchantEmiAnalytics,
    interestRateAnalytics
} = require("../../controller/admin/dashboard/emi.controller");

const {
    payLaterDashboard,
    payLaterSummary,
    recentPayLaterTransactions,
    providerAnalytics,
    dueDateAnalytics,
    merchantPayLaterAnalytics,
    dailyPayLaterAnalytics,
    upcomingDuePayments
} = require("../../controller/admin/dashboard/paylater.controller");

const adminLoginRateLimiter = require("../../middleware/rateLimiter/admin/adminLoginRateLimiter.middleware");

const {
    checkAdminLoginBlock
} = require(
    "../../middleware/security/admin/adminLoginSecurity.middleware"
);

const refreshTokenController =require("../../controller/admin/auth/refreshToken.controller");
const authorizeAdmin = require("../../middleware/authorizeAdmin.middleware");
const adminRefreshRateLimiter = require("../../middleware/rateLimiter/admin/adminRefreshRateLimiter.middleware");
const adminSensitiveActionRateLimiter = require("../../middleware/rateLimiter/admin/dminSensitiveActionRateLimiter.middleware");
const forgotPasswordController = require("../../controller/admin/auth/forgotPassword.controller");
const verifyForgotPasswordOtpController = require("../../controller/admin/auth/verifyForgotPasswordOtp.controller");
const resetPasswordController = require("../../controller/admin/auth/resetPassword.controller");
const adminForgotPasswordRateLimiter = require("../../middleware/rateLimiter/admin/adminForgotPasswordRateLimiter.middleware");
const adminVerifyForgotPasswordOtpRateLimiter = require("../../middleware/rateLimiter/admin/adminVerifyForgotPasswordOtpRateLimiter.middleware");
const adminResetPasswordRateLimiter = require("../../middleware/rateLimiter/admin/adminResetPasswordRateLimiter.middleware");
const adminCriticalActionRateLimiter = require("../../middleware/rateLimiter/admin/adminCriticalActionRateLimiter.middleware");
const adminReadRateLimiter = require("../../middleware/rateLimiter/admin/adminReadRateLimiter.middleware");



route.post(
    "/refresh",
    adminRefreshRateLimiter,
    refreshTokenController
);

route.post("/login", adminLoginRateLimiter,checkAdminLoginBlock ,adminlogin)
route.post(
    "/forgot-password",
    adminForgotPasswordRateLimiter,
    forgotPasswordController
);

route.post(
    "/verify-forgot-password-otp",
    adminVerifyForgotPasswordOtpRateLimiter,
    verifyForgotPasswordOtpController
);

route.post(
    "/reset-password",
    adminResetPasswordRateLimiter,
    resetPasswordController
);


route.use(authenticateAdmin);
route.use(authorizeAdmin("Admin"));


route.post("/logout", adminlogout)

route.post(
    "/logout-all",
    adminSensitiveActionRateLimiter,
    logoutAllController
);

route.patch(
    "/change-password",
    adminSensitiveActionRateLimiter,
    changePasswordController
);

route.patch("/kyc/:merchantId",adminCriticalActionRateLimiter, verifyKyc);

route.use(adminReadRateLimiter)

/** dashboard */
route.get("/dashboard", dashboardOverview);
route.get("/dashboard/summary", summaryCards);
route.get("/dashboard/recent-transactions", recentTransactions);
route.get("/dashboard/transaction-volume", transactionVolume);
route.get("/dashboard/success-rate", successRate);
route.get("/dashboard/payment-methods", paymentMethodAnalytics);
route.get("/dashboard/status", transactionStatusAnalytics);
route.get("/dashboard/top-merchants", topMerchants);

/* Analytics */
route.get("/analytics", dashboardAnalytics);
route.get("/analytics/transaction-trend", transactionTrend);
route.get("/analytics/revenue-trend", revenueTrend);
route.get("/analytics/payment-methods", paymentMethodDistribution);
route.get("/analytics/payment-providers", paymentProviderDistribution);
route.get("/analytics/merchant-performance",merchantPerformance);
route.get("/analytics/hourly-transactions",hourlyTransactions);
route.get("/analytics/currency", currencyAnalytics);
route.get("/analytics/status", statusAnalytics);

/* Transactions */
route.get("/transactions", transactionList);
route.get("/transactions/latest", latestTransactions);
route.get("/transactions/dashboard", dashboardTransactions);
route.get("/transactions/:transactionId", transactionDetails);

/* Refunds */
route.get("/refunds", refundDashboard);
route.get("/refunds/summary", refundSummary);
route.get("/refunds/recent", recentRefunds);
route.get("/refunds/analytics", refundAnalytics);
route.get("/refunds/merchant", merchantRefundAnalytics);
route.get("/refunds/status", refundStatusAnalytics);
/* Wallet */
route.get("/wallet", walletDashboard);
route.get("/wallet/summary", walletSummary);
route.get("/wallet/recent", recentWalletTransactions);
route.get("/wallet/analytics", walletAnalytics);
route.get("/wallet/status", walletStatusAnalytics);
route.get("/wallet/top", topWallets);

/* UPI */
route.get("/upi", upiDashboard);
route.get("/upi/summary", upiSummary);
route.get("/upi/recent", recentUpiTransactions);
route.get("/upi/analytics", upiAnalytics);
route.get("/upi/banks", bankAnalytics);
route.get("/upi/merchant", merchantUpiAnalytics);
route.get("/upi/verification", upiVerificationAnalytics);

/* Card */
route.get("/card", cardDashboard);
route.get("/card/summary", cardSummary);
route.get("/card/recent", recentCardTransactions);
route.get("/card/network", cardNetworkAnalytics);
route.get("/card/type", cardTypeAnalytics);
route.get("/card/banks", issuingBankAnalytics);
route.get("/card/merchant", merchantCardAnalytics);
route.get("/card/country", cardCountryAnalytics);

/* Net Banking */
route.get("/netbanking", netBankingDashboard);
route.get("/netbanking/summary", netBankingSummary);
route.get("/netbanking/recent", recentNetBankingTransactions);
route.get("/netbanking/banks", netBankBankAnalytics);
route.get("/netbanking/account-types", accountTypeAnalytics);
route.get("/netbanking/status", netBankingStatusAnalytics);
route.get("/netbanking/merchant", merchantNetBankingAnalytics);
route.get("/netbanking/bank-codes", bankCodeAnalytics);


/* EMI */
route.get("/emi", emiDashboard);
route.get("/emi/summary", emiSummary);
route.get("/emi/recent", recentEmiTransactions);
route.get("/emi/banks", emiBankAnalytics);
route.get("/emi/card-networks", emiCardNetworkAnalytics);
route.get("/emi/tenures", emiTenureAnalytics);
route.get("/emi/merchant", merchantEmiAnalytics);
route.get("/emi/interest-rates", interestRateAnalytics);

/* Pay Later */
route.get("/paylater", payLaterDashboard);
route.get("/paylater/summary", payLaterSummary);
route.get("/paylater/recent", recentPayLaterTransactions);
route.get("/paylater/providers", providerAnalytics);
route.get("/paylater/due-dates", dueDateAnalytics);
route.get("/paylater/merchant", merchantPayLaterAnalytics);
route.get("/paylater/daily", dailyPayLaterAnalytics);
route.get("/paylater/upcoming-due", upcomingDuePayments);

module.exports = route;