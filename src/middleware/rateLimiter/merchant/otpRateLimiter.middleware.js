const redis = require("../../../config/redis");

const MAX_OTP_REQUESTS = 4;

const COOLDOWN_SECONDS = 60;

const RESEND_WINDOW = 60 * 60; // 1 hour


const normalizeEmail = (email) => {
    return String(email || "")
        .trim()
        .toLowerCase();
};


const otpRateLimiter = async (
    req,
    res,
    next
) => {

    try {

        const email =
            normalizeEmail(
                req.body.email
            );


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required."

            });

        }


        // ==================================================
        // Redis Keys
        // ==================================================

        const countKey =
            `otp:resend:count:${email}`;

        const cooldownKey =
            `otp:resend:cooldown:${email}`;


        // ==================================================
        // Check 60-second cooldown
        // ==================================================

        const cooldown =
            await redis.get(
                cooldownKey
            );


        if (cooldown) {

            const ttl =
                await redis.ttl(
                    cooldownKey
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
        // Check maximum OTP requests
        // ==================================================

        const currentCount =
            await redis.get(
                countKey
            );


        if (
            currentCount &&
            Number(currentCount) >= MAX_OTP_REQUESTS
        ) {

            const ttl =
                await redis.ttl(
                    countKey
                );


            return res.status(429).json({

                success: false,

                message:
                    "OTP request limit exceeded. Please try again later.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : RESEND_WINDOW

            });

        }


        // ==================================================
        // Increase request count
        // ==================================================

        const count =
            await redis.incr(
                countKey
            );


        // First request → 1 hour window
        if (count === 1) {

            await redis.expire(
                countKey,
                RESEND_WINDOW
            );

        }


        // ==================================================
        // Set 60-second cooldown
        // ==================================================

        await redis.set(
            cooldownKey,
            "1",
            {
                EX: COOLDOWN_SECONDS
            }
        );


        // ==================================================
        // Continue
        // ==================================================

        next();


    } catch (error) {

        console.error(
            "OTP Rate Limiter Error:",
            error
        );

        /*
         * Fail-open so temporary Redis issues
         * don't completely break OTP service.
         */

        next();

    }

};


module.exports = {
    otpRateLimiter
};