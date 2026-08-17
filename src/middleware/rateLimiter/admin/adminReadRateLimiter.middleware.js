const redisClient = require("../../../config/redis");

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 100;

const adminReadRateLimiter = async (
    req,
    res,
    next
) => {

    try {

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

        const ip =
            (
                req.ip ||
                req.socket?.remoteAddress ||
                "unknown"
            )
                .replace(
                    /:/g,
                    "_"
                );

        const key =
            `rate_limit:admin:read:${adminId}:${ip}`;

        const count =
            await redisClient.incr(key);

        if (count === 1) {

            await redisClient.expire(
                key,
                WINDOW_SECONDS
            );

        }

        if (
            count > MAX_REQUESTS
        ) {

            const ttl =
                await redisClient.ttl(key);

            res.set(
                "Retry-After",
                String(
                    ttl > 0
                        ? ttl
                        : WINDOW_SECONDS
                )
            );

            return res.status(429).json({

                success: false,

                code:
                    "RATE_LIMIT_EXCEEDED",

                message:
                    "Too many read requests. Please try again later."

            });

        }

        next();

    } catch (error) {

        console.error(
            "Admin Read Rate Limiter Error:",
            error
        );

        // Temporary production-safe behaviour:
        // Redis failure should not break CMS reads.

        next();

    }

};

module.exports =
    adminReadRateLimiter;