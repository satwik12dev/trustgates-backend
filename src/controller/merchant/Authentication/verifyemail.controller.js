const crypto = require("crypto");

const db = require("../../../config/pool");
const redis = require("../../../config/redis");

const {
    recordEmailOtpFailure,
    clearEmailOtpAttempts,
    getMerchantSecurityLock
} = require("../../../services/security/securityLock.service");


const verifyEmail = async (req, res) => {

    try {

        let {
            email,
            otp
        } = req.body;


        // ==================================================
        // Normalize
        // ==================================================

        email =
            String(email || "")
                .trim()
                .toLowerCase();


        const otpString =
            String(otp || "")
                .trim();


        // ==================================================
        // Validate Input
        // ==================================================

        if (
            !email ||
            !otpString
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and OTP are required."

            });

        }


        if (
            !/^\d{6}$/.test(
                otpString
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP must be a valid 6-digit number."

            });

        }


        // ==================================================
        // Find Merchant
        // ==================================================

        const [
            merchantRows
        ] = await db.query(

            `
                SELECT

                    merchant_id,
                    email_verified,
                    approval_status,
                    account_status

                FROM merchants

                WHERE email = ?

                LIMIT 1
            `,

            [
                email
            ]

        );


        if (
            !merchantRows.length
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Merchant not found."

            });

        }


        const merchant =
            merchantRows[0];


        const merchantId =
            merchant.merchant_id;


        // ==================================================
        // Check Central Security Lock
        // ==================================================

        const securityLock =
            await getMerchantSecurityLock(
                merchantId
            );


        if (securityLock) {

            return res.status(423).json({

                success: false,

                message:
                    "Email verification is temporarily unavailable. Please try again later.",

                retryAfter:
                    securityLock.retryAfter

            });

        }


        // ==================================================
        // Already Verified
        // ==================================================

        if (
            merchant.email_verified
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Email already verified."

            });

        }


        // ==================================================
        // OTP Keys
        // ==================================================

        const otpKey =
            `email-otp:${merchantId}`;


        // ==================================================
        // Get OTP
        // ==================================================

        const savedOtpHash =
            await redis.get(
                otpKey
            );


        if (!savedOtpHash) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP has expired. Please request a new OTP."

            });

        }


        // ==================================================
        // Validate Stored Hash
        // ==================================================

        if (
            !/^[a-f0-9]{64}$/i.test(
                savedOtpHash
            )
        ) {

            console.error(
                "Invalid OTP hash stored in Redis."
            );


            return res.status(500).json({

                success: false,

                message:
                    "Invalid OTP data."

            });

        }


        // ==================================================
        // Hash Incoming OTP
        // ==================================================

        const incomingOtpHash =
            crypto
                .createHash("sha256")
                .update(otpString)
                .digest("hex");


        // ==================================================
        // Secure Compare
        // ==================================================

        const isValidOTP =
            crypto.timingSafeEqual(

                Buffer.from(
                    savedOtpHash,
                    "hex"
                ),

                Buffer.from(
                    incomingOtpHash,
                    "hex"
                )

            );


        // ==================================================
        // WRONG OTP
        // ==================================================

        if (!isValidOTP) {

            const failure =
                await recordEmailOtpFailure(
                    merchantId
                );


            // ----------------------------------------------
            // 5th Wrong OTP → Central Security Lock
            // ----------------------------------------------

            if (
                failure.locked
            ) {

                return res.status(423).json({

                    success: false,

                    message:
                        "Too many incorrect OTP attempts. Email verification and password recovery are temporarily blocked for security reasons.",

                    retryAfter:
                        failure.retryAfter

                });

            }


            return res.status(400).json({

                success: false,

                message:
                    "Invalid OTP.",

                remainingAttempts:
                    failure.remainingAttempts

            });

        }


        // ==================================================
        // Successful OTP
        // ==================================================

        await db.query(
            `
                UPDATE merchants
                SET email_verified = TRUE, account_status= "ACTIVE"
                WHERE merchant_id = ?
                LIMIT 1
            `,
            [merchantId]
        );


        // ==================================================
        // Clear OTP Attempts
        // ==================================================

        await clearEmailOtpAttempts(
            merchantId
        );


        // ==================================================
        // Delete OTP
        // ==================================================

        await redis.del(
            otpKey
        );


        return res.status(200).json({

            success: true,

            message:
                "Email verified successfully."

        });


    } catch (error) {

        console.error(
            "Verify Email Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error."

        });

    }

};


module.exports = verifyEmail;