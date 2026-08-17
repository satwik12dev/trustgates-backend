const bcrypt = require("bcrypt");

const db = require("../../../config/pool");

const generateToken =
    require("../../../utils/jwt.util");

const {
    createRefreshToken
} = require("../../../services/auth/refreshToken.service");

const {
    recordFailedLogin,
    clearFailedLogin
} = require("../../../middleware/security/merchant/loginSecurity.middleware");


// ==========================================================
// Merchant Login
// ==========================================================
//
// Login requirement:
//
// 1. Valid email/password
// 2. Email must be verified
//
// IMPORTANT:
//
// approval_status / kyc_status / account_status
// DO NOT block login.
//
// Dashboard access will be controlled separately.
//
// ==========================================================


const login = async (req, res) => {

    try {

        // ==================================================
        // 1. Get Request Data
        // ==================================================

        let {
            email,
            password
        } = req.body;


        // ==================================================
        // 2. Basic Validation
        // ==================================================

        if (
            email === undefined ||
            password === undefined ||
            email === null ||
            password === null
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        // ==================================================
        // 3. Normalize Email
        // ==================================================
        //
        // IMPORTANT:
        // Do NOT trim password.
        //
        // Password spaces can technically be valid.
        //
        // ==================================================

        email =
            String(email)
                .trim()
                .toLowerCase();

        password =
            String(password);


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        // ==================================================
        // 4. Email Validation
        // ==================================================

        const emailRegex =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


        if (
            !emailRegex.test(email)
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // ==================================================
        // 5. Find Merchant
        // ==================================================

        const [
            merchants
        ] = await db.query(

            `
                SELECT

                    merchant_id,
                    merchant_code,

                    merchant_name,
                    business_name,

                    email,
                    password_hash,

                    email_verified,

                    approval_status,
                    kyc_status,
                    account_status

                FROM merchants

                WHERE email = ?

                LIMIT 1
            `,

            [
                email
            ]

        );


        // ==================================================
        // 6. Merchant Not Found
        // ==================================================
        //
        // Generic response prevents email enumeration.
        //
        // ==================================================

        if (
            !merchants.length
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        const merchant =
            merchants[0];


        // ==================================================
        // 7. Password Verification
        // ==================================================

        const isPasswordValid =
            await bcrypt.compare(
                password,
                merchant.password_hash
            );


        // ==================================================
        // 8. Invalid Password
        // ==================================================

        if (!isPasswordValid) {

            const failedLogin =
                await recordFailedLogin(
                    email
                );


            // =================================================
            // Login Blocked
            // =================================================

            if (
                failedLogin.blocked
            ) {

                return res.status(423).json({

                    success: false,

                    message:
                        "Too many incorrect password attempts. Login has been blocked for 12 hours.",

                    retryAfter:
                        failedLogin.retryAfter

                });

            }


            // =================================================
            // Invalid Password
            // =================================================

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // ==================================================
        // 9. Password Correct
        // ==================================================
        //
        // Clear previous failed-login counter.
        //
        // ==================================================

        await clearFailedLogin(
            email
        );


        // ==================================================
        // 10. Email Verification Check
        // ==================================================
        //
        // Email verification is the ONLY account
        // requirement for login.
        //
        // ==================================================

        if (
            !Boolean(
                merchant.email_verified
            )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Please verify your email before logging in."

            });

        }


        // ==================================================
        // 11. Generate Access Token
        // ==================================================
        //
        // Centralized through jwt.util.js
        //
        // ==================================================

        const accessToken =
            generateToken(
                merchant.merchant_id,
                merchant.email
            );


        // ==================================================
        // 12. Generate Refresh Token
        // ==================================================
        //
        // Refresh token service handles:
        //
        // - secure random token
        // - hashing
        // - database storage
        // - expiry
        //
        // ==================================================

        const refreshTokenData =
            await createRefreshToken({

                merchantId:
                    merchant.merchant_id,

                userAgent:
                    req.headers["user-agent"]
                    || null,

                ipAddress:
                    req.ip
                    || null

            });


        // ==================================================
        // 13. Login History
        // ==================================================

        await db.query(

            `
                INSERT INTO login_history
                (
                    merchant_id,
                    ip_address,
                    user_agent,
                    login_status
                )

                VALUES
                (
                    ?,
                    ?,
                    ?,
                    'SUCCESS'
                )
            `,

            [

                merchant.merchant_id,

                req.ip
                    || null,

                req.headers["user-agent"]
                    || null

            ]

        );


        // ==================================================
        // 14. Login Response
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Login successful.",

            accessToken,

            refreshToken:
                refreshTokenData.refreshToken,

            merchant: {

                merchantId:
                    merchant.merchant_id,

                merchantCode:
                    merchant.merchant_code,

                merchantName:
                    merchant.merchant_name,

                businessName:
                    merchant.business_name,

                email:
                    merchant.email,

                emailVerified:
                    Boolean(
                        merchant.email_verified
                    ),

                approvalStatus:
                    merchant.approval_status,

                kycStatus:
                    merchant.kyc_status,

                accountStatus:
                    merchant.account_status

            }

        });


    } catch (error) {

        // ==================================================
        // Error Logging
        // ==================================================

        console.error(
            "Merchant Login Error:",
            error
        );


        // ==================================================
        // Production Response
        // ==================================================

        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error."

        });

    }

};


// ==========================================================
// Export
// ==========================================================

module.exports = login;