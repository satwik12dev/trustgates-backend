const argon2 = require("argon2");
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

const sendNewLoginAlertEmail =
    require("../../../services/email/sendNewLoginAlertEmail");

const sendAccountLockedEmail =
    require("../../../services/email/sendAccountLockedEmail");


// ==========================================================
// Argon2 Configuration
// ==========================================================

const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
};


// ==========================================================
// Merchant Login
// ==========================================================

const login = async (req, res) => {

    try {

        // ==================================================
        // 1. Request Data
        // ==================================================

        let {
            email,
            password
        } = req.body || {};


        // ==================================================
        // 2. Required Fields
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

        email =
            String(email)
                .trim()
                .toLowerCase();

        // Never trim password.
        password =
            String(password);


        if (!email || !password) {

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


        if (!emailRegex.test(email)) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // ==================================================
        // 5. Find Merchant
        // ==================================================

        const [merchants] =
            await db.query(

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

                [email]

            );


        // ==================================================
        // 6. Merchant Not Found
        // ==================================================

        if (!merchants.length) {

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

        let isPasswordValid = false;

        let isBcryptPassword = false;
        let isArgon2Password = false;


        const passwordHash =
            merchant.password_hash || "";


        // ==================================================
        // 7A. Argon2id Password
        // ==================================================

        if (
            passwordHash.startsWith("$argon2id$")
        ) {

            isArgon2Password = true;

            isPasswordValid =
                await argon2.verify(
                    passwordHash,
                    password
                );

        }


        // ==================================================
        // 7B. Legacy bcrypt Password
        // ==================================================

        else if (
            passwordHash.startsWith("$2a$") ||
            passwordHash.startsWith("$2b$") ||
            passwordHash.startsWith("$2y$")
        ) {

            isBcryptPassword = true;

            isPasswordValid =
                await bcrypt.compare(
                    password,
                    passwordHash
                );

        }


        // ==================================================
        // 8. Invalid Password
        // ==================================================

        if (!isPasswordValid) {

            const failedLogin =
                await recordFailedLogin(
                    email
                );


            if (
                failedLogin &&
                failedLogin.blocked
            ) {

                sendAccountLockedEmail(
                    merchant ? merchant.merchant_name : "",
                    email,
                    {
                        lockDuration: "12 hours",
                        reason: "5 consecutive failed password attempts."
                    }
                ).catch((err) => {
                    console.error("Failed to send account locked email:", err.message);
                });

                return res.status(423).json({

                    success: false,

                    message:
                        "Too many incorrect password attempts. Login has been blocked for 12 hours.",

                    retryAfter:
                        failedLogin.retryAfter

                });

            }


            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // ==================================================
        // 9. Clear Failed Login Counter
        // ==================================================

        await clearFailedLogin(
            email
        );


        // ==================================================
        // 10. Legacy bcrypt → Argon2id Migration
        // ==================================================
        //
        // IMPORTANT:
        // Migration is intentionally retained.
        //
        // Existing bcrypt users are migrated after
        // successful authentication.
        //
        // New password storage = Argon2id.
        //
        // ==================================================

        if (isBcryptPassword) {

            const newPasswordHash =
                await argon2.hash(
                    password,
                    ARGON2_OPTIONS
                );


            await db.query(

                `
                UPDATE merchants

                SET password_hash = ?

                WHERE merchant_id = ?
                `,

                [
                    newPasswordHash,
                    merchant.merchant_id
                ]

            );

        }


        // ==================================================
        // 11. Email Verification
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
        // 12. Generate Access Token
        // ==================================================

        const accessToken =
            generateToken(
                merchant.merchant_id,
                merchant.email
            );


        // ==================================================
        // 13. Generate Refresh Token
        // ==================================================

        const refreshTokenData =
            await createRefreshToken({

                merchantId:
                    merchant.merchant_id,

                userAgent:
                    req.headers["user-agent"] || null,

                ipAddress:
                    req.ip || null

            });


        // ==================================================
        // 14. Login History
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

                req.ip || null,

                req.headers["user-agent"] || null
            ]
        );


        // ==================================================
        // 14.1 Send Login Alert Email
        // ==================================================

        sendNewLoginAlertEmail(
            merchant.merchant_name,
            merchant.email,
            {
                ip: req.ip || req.headers["x-forwarded-for"] || "N/A",
                userAgent: req.headers["user-agent"] || "Unknown Device",
                time: new Date().toUTCString()
            }
        ).catch((err) => {
            console.error("Failed to send new login alert email:", err.message);
        });


        // ==================================================
        // 15. Success Response
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
        // Production Server Logging
        // ==================================================

        console.error(
            "Merchant Login Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error."

        });

    }

};


module.exports = login;