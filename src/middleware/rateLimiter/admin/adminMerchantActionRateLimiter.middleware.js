const redis = require("../../../config/redis");

const WINDOW_SECONDS = 15 * 60;
const MAX_REQUESTS = 30;

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

const adminMerchantActionRateLimiter = async (
    req,
    res,
    next
) => {

    try {

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {
            return res.status(401).json({
                success: false,
                code: "ADMIN_AUTH_REQUIRED",
                message: "Admin authentication is required."
            });
        }

        const ip =
            req.ip ||
            req.socket?.remoteAddress ||
            "unknown";

        const normalizedIp =
            String(ip)
                .replace(/^::ffff:/, "");

        const adminId =
            Number(req.admin.admin_id);

        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {
            return res.status(401).json({
                success: false,
                code: "INVALID_ADMIN_CONTEXT",
                message: "Invalid admin authentication context."
            });
        }

        const ipKey =
            `rl:admin:merchant:action:ip:${normalizedIp}`;

        const adminKey =
            `rl:admin:merchant:action:admin:${adminId}`;

        const [
            ipCount,
            adminCount
        ] = await Promise.all([
            incrementCounter(ipKey),
            incrementCounter(adminKey)
        ]);

        if (
            ipCount > MAX_REQUESTS ||
            adminCount > MAX_REQUESTS
        ) {

            const [
                ipTtl,
                adminTtl
            ] = await Promise.all([
                redis.ttl(ipKey),
                redis.ttl(adminKey)
            ]);

            const retryAfter =
                Math.max(
                    ipTtl,
                    adminTtl,
                    1
                );

            return res
                .status(429)
                .set(
                    "Retry-After",
                    String(retryAfter)
                )
                .json({

                    success: false,

                    code:
                        "ADMIN_MERCHANT_RATE_LIMIT_EXCEEDED",

                    message:
                        "Too many merchant management requests. Please try again later.",

                    retryAfter

                });
        }

        const remaining =
            Math.max(
                0,
                Math.min(
                    MAX_REQUESTS - ipCount,
                    MAX_REQUESTS - adminCount
                )
            );

        res.set(
            "X-RateLimit-Limit",
            String(MAX_REQUESTS)
        );

        res.set(
            "X-RateLimit-Remaining",
            String(remaining)
        );

        next();

    } catch (error) {

        console.error(
            "Admin Merchant Rate Limiter Error:",
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
    adminMerchantActionRateLimiter;