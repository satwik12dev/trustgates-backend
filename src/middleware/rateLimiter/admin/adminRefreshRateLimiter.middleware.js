const redis = require("../../../config/redis");

const WINDOW_SECONDS = 15 * 60;
const MAX_REQUESTS = 10;

const incrementCounter = async (key) => {

    const count = await redis.incr(key);

    if (count === 1) {
        await redis.expire(
            key,
            WINDOW_SECONDS
        );
    }

    return count;
};

const adminRefreshRateLimiter = async (
    req,
    res,
    next
) => {

    try {

        const ip =
            req.ip ||
            req.socket?.remoteAddress ||
            "unknown";

        const normalizedIp =
            String(ip)
                .replace(/^::ffff:/, "");

        const key =
            `rl:admin:refresh:${normalizedIp}`;

        const count =
            await incrementCounter(key);

        if (count > MAX_REQUESTS) {

            const ttl =
                await redis.ttl(key);

            const retryAfter =
                ttl > 0
                    ? ttl
                    : WINDOW_SECONDS;

            return res
                .status(429)
                .set(
                    "Retry-After",
                    String(retryAfter)
                )
                .json({

                    success: false,

                    code:
                        "ADMIN_REFRESH_RATE_LIMIT_EXCEEDED",

                    message:
                        "Too many refresh token requests. Please try again later.",

                    retryAfter

                });
        }

        res.set(
            "X-RateLimit-Limit",
            String(MAX_REQUESTS)
        );

        res.set(
            "X-RateLimit-Remaining",
            String(
                Math.max(
                    0,
                    MAX_REQUESTS - count
                )
            )
        );

        next();

    } catch (error) {

        console.error(
            "Admin Refresh Rate Limiter Error:",
            error.message
        );

        return res.status(503).json({

            success: false,

            code:
                "SECURITY_SERVICE_UNAVAILABLE",

            message:
                "Security service temporarily unavailable. Please try again."

        });

    }
};

module.exports =
    adminRefreshRateLimiter;