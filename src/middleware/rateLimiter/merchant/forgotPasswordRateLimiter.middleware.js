const redis = require("../../../config/redis");


// ==========================================================
// Constants
// ==========================================================

const MAX_REQUESTS = 4;

// 60 seconds between requests
const COOLDOWN_SECONDS = 60;

// Counter window
const REQUEST_WINDOW = 60 * 60;

// ==========================================================
// Normalize Email
// ==========================================================

const normalizeEmail = (email) => {

    return String(email || "")
        .trim()
        .toLowerCase();

};


// ==========================================================
// Forgot Password Rate Limiter
// ==========================================================
//
// Protects:
//
// POST /forgot-password
//
// Limits:
//
// 4 requests / hour / email
// 4 requests / hour / IP
// 60 sec cooldown
//
// ==========================================================

const forgotPasswordRateLimiter = async (
    req,
    res,
    next
) => {

    try {

        const email =
            normalizeEmail(
                req.body.email
            );


        const ip =
            req.ip ||
            "unknown";


        // ==================================================
        // Basic Input Check
        // ==================================================

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

        const emailCountKey =
            `forgot-password:count:email:${email}`;

        const emailCooldownKey =
            `forgot-password:cooldown:email:${email}`;

        const ipCountKey =
            `forgot-password:count:ip:${ip}`;

        const ipCooldownKey =
            `forgot-password:cooldown:ip:${ip}`;


        // ==================================================
        // Check Email Cooldown
        // ==================================================

        const emailCooldown =
            await redis.get(
                emailCooldownKey
            );


        if (emailCooldown) {

            const ttl =
                await redis.ttl(
                    emailCooldownKey
                );


            return res.status(429).json({

                success: false,

                message:
                    "Please wait before requesting another password reset.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : COOLDOWN_SECONDS

            });

        }


        // ==================================================
        // Check IP Cooldown
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
                    "Too many password reset requests. Please wait before trying again.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : COOLDOWN_SECONDS

            });

        }


        // ==================================================
        // Check Email Request Count
        // ==================================================

        const emailCount =
            Number(
                await redis.get(
                    emailCountKey
                )
            ) || 0;


        if (
            emailCount >=
            MAX_REQUESTS
        ) {

            const ttl =
                await redis.ttl(
                    emailCountKey
                );


            return res.status(429).json({

                success: false,

                message:
                    "Password reset request limit exceeded. Please try again later.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : REQUEST_WINDOW

            });

        }


        // ==================================================
        // Check IP Request Count
        // ==================================================

        const ipCount =
            Number(
                await redis.get(
                    ipCountKey
                )
            ) || 0;


        // --------------------------------------------------
        // Example:
        //
        // 20 password reset requests/hour/IP
        // --------------------------------------------------

        const MAX_IP_REQUESTS = 20;


        if (
            ipCount >=
            MAX_IP_REQUESTS
        ) {

            const ttl =
                await redis.ttl(
                    ipCountKey
                );


            return res.status(429).json({

                success: false,

                message:
                    "Too many password reset requests from this network. Please try again later.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : REQUEST_WINDOW

            });

        }


        // ==================================================
        // Increment Email Counter
        // ==================================================

        const newEmailCount =
            await redis.incr(
                emailCountKey
            );


        if (
            newEmailCount === 1
        ) {

            await redis.expire(
                emailCountKey,
                REQUEST_WINDOW
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
                REQUEST_WINDOW
            );

        }


        // ==================================================
        // Set Cooldowns
        // ==================================================

        await redis.set(

            emailCooldownKey,

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


        // ==================================================
        // Continue
        // ==================================================

        next();


    } catch (error) {

        console.error(
            "Forgot Password Rate Limiter Error:",
            error
        );


        /*
         * Fail-open.
         *
         * If Redis temporarily fails,
         * authentication service should not
         * completely stop working.
         */

        return next();

    }

};


module.exports = {
    forgotPasswordRateLimiter
};