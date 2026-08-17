const redis = require("../../../config/redis");


// ==========================================================
// Global API Rate Limiter
// ==========================================================
//
// Default:
// 100 requests / minute / IP
//
// ==========================================================

const globalRateLimiter = async (req, res, next) => {

    try {

        const ip =
            req.ip ||
            req.headers["x-forwarded-for"] ||
            "unknown";

        const key =
            `rate-limit:global:${ip}`;

        const current =
            await redis.incr(key);


        // First request → 60 sec expiry
        if (current === 1) {
            await redis.expire(
                key,
                60
            );
        }


        if (current > 100) {

            const ttl =
                await redis.ttl(key);

            return res.status(429).json({

                success: false,

                message:
                    "Too many requests. Please try again later.",

                retryAfter:
                    ttl > 0 ? ttl : 60

            });

        }


        next();

    } catch (error) {

        console.error(
            "Global Rate Limiter Error:",
            error
        );

        // Rate limiter failure should not
        // take the complete API down.

        next();
    }
};


module.exports = {
    globalRateLimiter
};
