const crypto = require("crypto");

const db = require("../../../config/pool");
const redis = require("../../../config/redis");

const generateOTP =
    require("../../../utils/otp.utils");

const sendOTPEmail =
    require("../../../services/email/email.services");

const {
    getMerchantSecurityLock
} =
    require("../../../services/security/securityLock.service");


const resendOTP = async (
    req,
    res
) => {

    try {

        let {
            email
        } = req.body;


        email =
            String(email || "")
                .trim()
                .toLowerCase();


        // ==================================================
        // Validate
        // ==================================================

        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required."

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
                    merchant_name,
                    email,
                    email_verified

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
        // Central Security Lock
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
                    "Email is already verified."

            });

        }


        // ==================================================
        // 60 Second Cooldown
        // ==================================================

        const resendKey =
            `email-otp-resend:${merchantId}`;


        const cooldown =
            await redis.get(
                resendKey
            );


        if (cooldown) {

            const ttl =
                await redis.ttl(
                    resendKey
                );


            return res.status(429).json({

                success: false,

                message:
                    "Please wait before requesting another OTP.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : 60

            });

        }


        // ==================================================
        // Generate OTP
        // ==================================================

        const otp =
            generateOTP();


        const otpHash =
            crypto
                .createHash("sha256")
                .update(String(otp))
                .digest("hex");


        // ==================================================
        // Store OTP
        // ==================================================

        await redis.set(

            `email-otp:${merchantId}`,

            otpHash,

            {
                EX: 600
            }

        );


        // ==================================================
        // Reset Wrong Attempts
        // ==================================================

        await redis.del(

            `email-otp-attempts:${merchantId}`

        );


        // ==================================================
        // Send Email FIRST
        // ==================================================

        await sendOTPEmail(

            merchant.email,

            merchant.merchant_name,

            otp

        );


        // ==================================================
        // Set Cooldown Only After Successful Email
        // ==================================================

        await redis.set(

            resendKey,

            "1",

            {
                EX: 60
            }

        );


        return res.status(200).json({

            success: true,

            message:
                "OTP resent successfully."

        });


    } catch (error) {

        console.error(
            "Resend OTP Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error."

        });

    }

};


module.exports = resendOTP;