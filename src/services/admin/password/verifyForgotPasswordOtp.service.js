const crypto = require("crypto");

const db = require("../../../config/pool");
const redis = require("../../../config/redis");

const {
    hashOtp
} = require("./forgotPassword.service");


const OTP_MAX_ATTEMPTS = 5;

const RESET_TOKEN_EXPIRY_SECONDS =
    10 * 60;


const generateResetToken = () => {

    return crypto
        .randomBytes(32)
        .toString("hex");
};


const hashResetToken = (
    resetToken
) => {

    return crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
};


const verifyForgotPasswordOtpService =
    async (
        email,
        otp
    ) => {

        const normalizedEmail =
            typeof email === "string"
                ? email.trim().toLowerCase()
                : "";


        if (
            !normalizedEmail ||
            typeof otp !== "string"
        ) {

            throw new Error(
                "Invalid OTP request."
            );
        }


        const normalizedOtp =
            otp.trim();


        if (
            !/^\d{6}$/.test(
                normalizedOtp
            )
        ) {

            throw new Error(
                "Invalid OTP."
            );
        }


        const otpKey =
            `admin:forgot-password:otp:${normalizedEmail}`;


        const otpRaw =
            await redis.get(
                otpKey
            );


        if (!otpRaw) {

            throw new Error(
                "OTP expired or not found."
            );
        }


        let otpData;


        try {

            otpData =
                JSON.parse(
                    otpRaw
                );

        } catch (_) {

            await redis.del(
                otpKey
            );

            throw new Error(
                "Invalid OTP."
            );
        }


        const attempts =
            Number(
                otpData.attempts || 0
            );


        if (
            attempts >=
            OTP_MAX_ATTEMPTS
        ) {

            await redis.del(
                otpKey
            );

            throw new Error(
                "OTP verification attempts exceeded."
            );
        }


        const providedOtpHash =
            hashOtp(
                normalizedOtp
            );


        const otpMatches =
            crypto.timingSafeEqual(
                Buffer.from(
                    providedOtpHash,
                    "utf8"
                ),
                Buffer.from(
                    otpData.otpHash,
                    "utf8"
                )
            );


        if (!otpMatches) {

            otpData.attempts =
                attempts + 1;


            const ttl =
                await redis.ttl(
                    otpKey
                );


            if (ttl > 0) {

                await redis.set(
                    otpKey,
                    JSON.stringify(
                        otpData
                    ),
                    {
                        EX: ttl
                    }
                );
            }


            if (
                otpData.attempts >=
                OTP_MAX_ATTEMPTS
            ) {

                await redis.del(
                    otpKey
                );

                throw new Error(
                    "OTP verification attempts exceeded."
                );
            }


            throw new Error(
                "Invalid OTP."
            );
        }


        const [adminRows] =
            await db.query(
                `
                SELECT
                    admin_id,
                    email,
                    status
                FROM admins
                WHERE admin_id = ?
                LIMIT 1
                `,
                [otpData.adminId]
            );


        if (!adminRows.length) {

            await redis.del(
                otpKey
            );

            throw new Error(
                "Admin account not found."
            );
        }


        const admin =
            adminRows[0];


        if (
            admin.status !== "ACTIVE"
        ) {

            await redis.del(
                otpKey
            );

            throw new Error(
                "Admin account is inactive."
            );
        }


        const resetToken =
            generateResetToken();


        const resetTokenHash =
            hashResetToken(
                resetToken
            );


        const resetKey =
            `admin:forgot-password:reset:${resetTokenHash}`;


        const resetData = {

            adminId:
                admin.admin_id,

            email:
                admin.email,

            createdAt:
                Date.now()
        };


        await redis.set(
            resetKey,
            JSON.stringify(
                resetData
            ),
            {
                EX:
                    RESET_TOKEN_EXPIRY_SECONDS
            }
        );


        await redis.del(
            otpKey
        );


        return {

            success: true,

            resetToken,

            message:
                "OTP verified successfully."
        };
    };


module.exports = {
    verifyForgotPasswordOtpService,
    generateResetToken,
    hashResetToken
};