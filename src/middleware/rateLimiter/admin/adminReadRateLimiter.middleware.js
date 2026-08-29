const redisClient =
    require("../../../config/redis");


// ==========================================================
// Admin Read Rate Limiter
// ==========================================================
//
// 100 requests / minute
// Per Admin + IP
//
// IMPORTANT:
// - Does NOT block IP
// - Only returns 429 when limit is exceeded
// - v2 key namespace prevents old counters from affecting
//   the new deployment
//
// ==========================================================

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 500;


// ==========================================================
// Admin Read Rate Limiter
// ==========================================================

const adminReadRateLimiter = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication
        // ==================================================

        const adminId =
            req.admin?.admin_id;


        if (!adminId) {

            return res.status(401).json({

                success: false,

                code:
                    "ADMIN_AUTH_REQUIRED",

                message:
                    "Admin authentication is required."

            });

        }


        // ==================================================
        // Client IP
        // ==================================================

        const ip =
            req.ip ||
            req.socket?.remoteAddress ||
            "unknown";


        const normalizedIp =
            String(ip)
                .replace(
                    /:/g,
                    "_"
                );


        // ==================================================
        // Redis Key
        // ==================================================
        //
        // v2 creates a fresh rate-limit namespace.
        //
        // Old:
        // rate_limit:admin:read:...
        //
        // New:
        // rate_limit:v2:admin:read:...
        //
        // Old Redis counters remain untouched.
        //
        // ==================================================

        const key =
            `rate_limit:v2:admin:read:${adminId}:${normalizedIp}`;


        // ==================================================
        // Increment Counter
        // ==================================================

        const count =
            await redisClient.incr(
                key
            );


        // ==================================================
        // Start 60 Second Window
        // ==================================================

        if (
            count === 1
        ) {

            await redisClient.expire(
                key,
                WINDOW_SECONDS
            );

        }


        // ==================================================
        // Limit Exceeded
        // ==================================================

        if (
            count > MAX_REQUESTS
        ) {

            const ttl =
                await redisClient.ttl(
                    key
                );


            const retryAfter =
                ttl > 0
                    ? ttl
                    : WINDOW_SECONDS;


            // ----------------------------------------------
            // Headers
            // ----------------------------------------------

            res.set(
                "Retry-After",
                String(retryAfter)
            );

            res.set(
                "X-RateLimit-Limit",
                String(MAX_REQUESTS)
            );

            res.set(
                "X-RateLimit-Remaining",
                "0"
            );


            // ----------------------------------------------
            // Response
            // ----------------------------------------------

            return res.status(429).json({

                success: false,

                code:
                    "ADMIN_READ_RATE_LIMIT_EXCEEDED",

                message:
                    "Too many read requests. Please try again later.",

                retryAfter

            });

        }


        // ==================================================
        // Rate Limit Headers
        // ==================================================

        const remaining =
            Math.max(
                0,
                MAX_REQUESTS - count
            );


        res.set(
            "X-RateLimit-Limit",
            String(MAX_REQUESTS)
        );

        res.set(
            "X-RateLimit-Remaining",
            String(remaining)
        );


        // ==================================================
        // Continue
        // ==================================================

        return next();


    } catch (error) {

        console.error(
            "Admin Read Rate Limiter Error:",
            error.message
        );


        // ==================================================
        // Fail Open
        // ==================================================
        //
        // Redis failure should not make dashboard reads
        // unavailable.
        //
        // ==================================================

        return next();

    }

};


// ==========================================================
// Export
// ==========================================================

module.exports =
    adminReadRateLimiter;
