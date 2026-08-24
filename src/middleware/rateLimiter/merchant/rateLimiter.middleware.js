const redis = require("../../../config/redis");


// ==========================================================
// Global API Rate Limiter
// ==========================================================
//
// Production:
// 100 requests / minute / IP
//
// Load Testing:
// 500 requests / minute / IP
//
// ==========================================================


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
            req.ip ||
            req.headers["x-forwarded-for"] ||
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
            await redis.incr(
                key
            );


        // ==================================================
        // First Request
        // Start 60 Second Window
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

        if (
            current > maxRequests
        ) {

            const ttl =
                await redis.ttl(
                    key
                );


            return res.status(429).json({

                success: false,

                message:
                    "Too many requests. Please try again later.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : WINDOW_SECONDS

            });

        }


        // ==================================================
        // Continue
        // ==================================================

        return next();


    } catch (error) {

        console.error(
            "Global Rate Limiter Error:",
            error
        );


        // ==================================================
        // Fail Open
        // ==================================================

        return next();

    }

};


module.exports = {

    globalRateLimiter

};