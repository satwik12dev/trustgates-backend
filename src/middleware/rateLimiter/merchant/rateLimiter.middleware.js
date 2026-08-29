const redis = require("../../../config/redis");

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
            req.ip ||
            "unknown";


        // ==================================================
        // Redis Key
        // ==================================================

        const key =
            `rate-limit:global:${ip}`;


        // ==================================================
        // Select Limit
        // ==================================================

        const isLoadTesting =
            process.env.LOAD_TESTING === "true";

        const maxRequests =
            isLoadTesting
                ? LOAD_TEST_LIMIT
                : PRODUCTION_LIMIT;


        // ==================================================
        // Increment Counter
        // ==================================================

        const current =
            await redis.incr(key);


        // ==================================================
        // Start Window
        // ==================================================

        if (current === 1) {

            await redis.expire(
                key,
                WINDOW_SECONDS
            );

        }


        // ==================================================
        // Limit Exceeded
        // ==================================================

        if (current > maxRequests) {

            const ttl =
                await redis.ttl(key);

            const retryAfter =
                ttl > 0
                    ? ttl
                    : WINDOW_SECONDS;


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


        // ==================================================
        // Rate Limit Headers
        // ==================================================

        res.set(
            "X-RateLimit-Limit",
            String(maxRequests)
        );

        res.set(
            "X-RateLimit-Remaining",
            String(
                Math.max(
                    0,
                    maxRequests - current
                )
            )
        );


        // ==================================================
        // Continue
        // ==================================================

        return next();


    } catch (error) {

        console.error(
            "Global Rate Limiter Error:",
            error.message
        );


        // ==================================================
        // Fail Open
        // ==================================================
        //
        // Redis failure should not make the entire API
        // unavailable.
        //
        // Route-specific security middleware can still
        // protect sensitive endpoints.
        //
        // ==================================================

        return next();

    }

};


module.exports = {
    globalRateLimiter
};
