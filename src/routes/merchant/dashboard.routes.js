const express = require("express");
const route = express.Router();

const login = require("../../controller/merchant/Authentication/login.controller");
const logout = require("../../controller/merchant/Authentication/logout.controller");
const signup = require("../../controller/merchant/Authentication/signup.controller");

const {
    loginRateLimiter
} = require("../../middleware/rateLimiter/merchant/loginRateLimiter.middleware");

const {
    checkLoginBlock
} = require("../../middleware/security/merchant/loginSecurity.middleware");

const forgotPassword = require("../../controller/merchant/Password/forgotPassword.controller");
const validateResetToken = require("../../controller/merchant/Password/validateResetToken.controller");
const requestPasswordChange = require("../../controller/merchant/Password/requestPasswordChange.controller");
const verifyPasswordReset = require("../../controller/merchant/Password/verifyPasswordReset.controller");

const uploadKycMiddleware = require("../../middleware/uploadKYC");
const { uploadKyc } = require("../../controller/merchant/kyc/kyc.controller");

// ==========================================
// Authentication Middleware
// ==========================================
const authenticate = require("../../middleware/auth.middleware");

const verifyKyc = require("../../controller/admin/kycVerify/verifyKyc.controller");

const {
    dashboardSummary
} = require("../../controller/merchant/dashboard/summary.controller");


const {
    dashboardAnalytics
} = require("../../controller/merchant/dashboard/analytics.controller");


const {
    recentTransactions
} = require("../../controller/merchant/dashboard/recentTransactions.controller");


const {
    walletOverview
} = require("../../controller/merchant/dashboard/wallet.controller");


const {
    refundOverview
} = require("../../controller/merchant/dashboard/refund.controller");

const refreshTokenController = require("../../controller/merchant/Authentication/refreshToken.controller");
const { otpRateLimiter } = require("../../middleware/rateLimiter/merchant/otpRateLimiter.middleware");
const { forgotPasswordRateLimiter } = require("../../middleware/rateLimiter/merchant/forgotPasswordRateLimiter.middleware");
const { passwordResetOtpRateLimiter } = require("../../middleware/rateLimiter/merchant/passwordResetOtpRateLimiter.middleware");
const { signupRateLimiter } = require("../../middleware/rateLimiter/merchant/signupRateLimiter.middleware");
const { checkDashboardAccess } = require("../../middleware/dashboardAccess.middleware");


// ==========================================================
// Authentication
// ==========================================================

route.post(
    "/login",
    loginRateLimiter,
    checkLoginBlock,
    login
);

route.post(
    "/logout",
    authenticate,
    logout
);

route.post(
    "/signup",
    signupRateLimiter,
    signup
);


// ==========================================================
// Email OTP
// ==========================================================

route.post(
    "/send-otp",
    otpRateLimiter,
    require("../../controller/merchant/Authentication/sendOtp.controller")
);

route.post(
    "/resend-otp",
    otpRateLimiter,
    require("../../controller/merchant/Authentication/resendOTP.controller")
);

route.post(
    "/verifyEmail",
    require("../../controller/merchant/Authentication/verifyemail.controller")
);


// ==========================================================
// Password Reset
// ==========================================================

route.post(
    "/forgot-password",
    forgotPasswordRateLimiter,
    forgotPassword
);

route.post(
    "/validate-reset-token",
    validateResetToken
);

route.post(
    "/request-password-change",
    passwordResetOtpRateLimiter,
    requestPasswordChange
);

route.post(
    "/verify-password-reset",
    verifyPasswordReset
);


// ==========================================================
// Refresh Token
// ==========================================================

route.post(
    "/refresh",
    refreshTokenController
);

route.post("/upload-kyc-doc", authenticate, uploadKycMiddleware, uploadKyc);

route.get(

    "/summary",

    authenticate,
    dashboardSummary
);



// ==========================================================
// Dashboard Analytics
// ==========================================================

route.get("/analytics",authenticate,dashboardAnalytics);

route.get(
    "/recent-transactions",
    authenticate,
    recentTransactions
);

route.get(
    "/wallet",
    authenticate,
    walletOverview
);

route.get(
    "/refunds",
    authenticate,
    refundOverview
);




module.exports = route;