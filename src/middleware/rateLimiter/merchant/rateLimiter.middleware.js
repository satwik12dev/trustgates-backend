const redis = require("../../../config/redis");

const PRODUCTION_LIMIT = 100;
const LOAD_TEST_LIMIT = 500;

const WINDOW_SECONDS = 60;


// ==========================================================
// Global Rate Limiter
// ==========================================================

const globalRateLimiter = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Get Client IP
        // ==================================================

        const ip =
            req.ip || "unknown";


        // ==================================================
        // Redis Key
        // ==================================================

        const key =
            `rate-limit:global:${ip}`;


        // ==================================================
        // Determine Current Limit
        // ==================================================

        const isLoadTesting =
            process.env.LOAD_TESTING;


        const maxRequests =
            isLoadTesting
                ? LOAD_TEST_LIMIT
                : PRODUCTION_LIMIT;


        // ==================================================
        // Increment Redis Counter
        // ==================================================

        const current =
            await redis.incr(key);


        // ==================================================
        // Start New 60 Second Window
        // ==================================================

        if (current === 1) {

            await redis.expire(
                key,
                WINDOW_SECONDS
            );

        }


        // ==================================================
        // Rate Limit Exceeded
        // ==================================================

        if (
            current > maxRequests
        ) {

            const ttl =
                await redis.ttl(key);


            const retryAfter =
                ttl > 0
                    ? ttl
                    : WINDOW_SECONDS;


            // ----------------------------------------------
            // Response Headers
            // ----------------------------------------------

            res.set(
                "Retry-After",
                String(retryAfter)
            );


            res.set(
                "X-RateLimit-Limit",
                String(maxRequests)
            );


            res.set(
                "X-RateLimit-Remaining",
                "0"
            );

            return res.status(429).json({

                success: false,

                code:
                    "GLOBAL_RATE_LIMIT_EXCEEDED",

                message:
                    "Too many requests. Please try again later.",

                retryAfter

            });

        }

        const remaining =
            Math.max(
                0,
                maxRequests - current
            );


        res.set(
            "X-RateLimit-Limit",
            String(maxRequests)
        );


        res.set(
            "X-RateLimit-Remaining",
            String(remaining)
        );
        return next();

    } catch (error) {

        console.error(
            "Global Rate Limiter Error:",
            error.message
        );

        return next();

    }

};


module.exports = {
    globalRateLimiter
};