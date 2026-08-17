const redis = require("../../../config/redis");


// ==========================================================
// Constants
// ==========================================================

const MAX_OTP_REQUESTS = 4;

const COOLDOWN_SECONDS = 60;

const OTP_REQUEST_WINDOW = 60 * 60;


// ==========================================================
// Password Reset OTP Rate Limiter
// ==========================================================

const passwordResetOtpRateLimiter = async (
    req,
    res,
    next
) => {

    try {

        const token =
            String(
                req.body.token || ""
            ).trim();


        const ip =
            req.ip ||
            "unknown";


        // ==================================================
        // Token Required
        // ==================================================

        if (!token) {

            return res.status(400).json({

                success: false,

                message:
                    "Reset token is required."

            });

        }


        // ==================================================
        // Hash Reset Token
        // ==================================================
        //
        // Do NOT put raw reset token
        // directly into Redis key.
        //
        // ==================================================

        const crypto =
            require("crypto");


        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        // ==================================================
        // Redis Keys
        // ==================================================

        const tokenCountKey =
            `password-reset:otp-count:${tokenHash}`;

        const tokenCooldownKey =
            `password-reset:otp-cooldown:${tokenHash}`;

        const ipCountKey =
            `password-reset:otp-ip-count:${ip}`;

        const ipCooldownKey =
            `password-reset:otp-ip-cooldown:${ip}`;


        // ==================================================
        // Token Cooldown
        // ==================================================

        const tokenCooldown =
            await redis.get(
                tokenCooldownKey
            );


        if (tokenCooldown) {

            const ttl =
                await redis.ttl(
                    tokenCooldownKey
                );


            return res.status(429).json({

                success: false,

                message:
                    "Please wait before requesting another OTP.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : COOLDOWN_SECONDS

            });

        }


        // ==================================================
        // IP Cooldown
        // ==================================================

        const ipCooldown =
            await redis.get(
                ipCooldownKey
            );


        if (ipCooldown) {

            const ttl =
                await redis.ttl(
                    ipCooldownKey
                );


            return res.status(429).json({

                success: false,

                message:
                    "Please wait before requesting another OTP.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : COOLDOWN_SECONDS

            });

        }


        // ==================================================
        // Token Request Count
        // ==================================================

        const tokenCount =
            Number(
                await redis.get(
                    tokenCountKey
                )
            ) || 0;


        if (
            tokenCount >=
            MAX_OTP_REQUESTS
        ) {

            const ttl =
                await redis.ttl(
                    tokenCountKey
                );


            return res.status(429).json({

                success: false,

                message:
                    "Maximum OTP requests exceeded. Please start a new password reset process.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : OTP_REQUEST_WINDOW

            });

        }


        // ==================================================
        // IP OTP Limit
        // ==================================================

        const ipCount =
            Number(
                await redis.get(
                    ipCountKey
                )
            ) || 0;


        const MAX_IP_OTP_REQUESTS =
            20;


        if (
            ipCount >=
            MAX_IP_OTP_REQUESTS
        ) {

            const ttl =
                await redis.ttl(
                    ipCountKey
                );


            return res.status(429).json({

                success: false,

                message:
                    "Too many OTP requests from this network. Please try again later.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : OTP_REQUEST_WINDOW

            });

        }


        // ==================================================
        // Increment Token Counter
        // ==================================================

        const newTokenCount =
            await redis.incr(
                tokenCountKey
            );


        if (
            newTokenCount === 1
        ) {

            await redis.expire(
                tokenCountKey,
                OTP_REQUEST_WINDOW
            );

        }


        // ==================================================
        // Increment IP Counter
        // ==================================================

        const newIpCount =
            await redis.incr(
                ipCountKey
            );


        if (
            newIpCount === 1
        ) {

            await redis.expire(
                ipCountKey,
                OTP_REQUEST_WINDOW
            );

        }


        // ==================================================
        // Cooldowns
        // ==================================================

        await redis.set(

            tokenCooldownKey,

            "1",

            {
                EX:
                    COOLDOWN_SECONDS
            }

        );


        await redis.set(

            ipCooldownKey,

            "1",

            {
                EX:
                    COOLDOWN_SECONDS
            }

        );


        next();


    } catch (error) {

        console.error(
            "Password Reset OTP Rate Limiter Error:",
            error
        );

        return next();

    }

};


module.exports = {
    passwordResetOtpRateLimiter
};