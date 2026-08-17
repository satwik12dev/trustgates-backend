const redis =
    require("../../../config/redis");


// ==========================================================
// Merchant Sensitive Rate Limiter
// ==========================================================
//
// Limit:
// 10 requests / 15 minutes
//
// Used for:
// - API credential regeneration
// - API credential revoke
// - Sensitive account operations
//
// Protection:
// IP + Merchant ID
//
// ==========================================================

const WINDOW_SECONDS =
    15 * 60;

const MAX_REQUESTS =
    10;


// ==========================================================
// Increment Counter
// ==========================================================

const incrementCounter = async (
    key
) => {

    const count =
        await redis.incr(key);


    if (
        count === 1
    ) {

        await redis.expire(
            key,
            WINDOW_SECONDS
        );

    }


    return count;

};


// ==========================================================
// Merchant Sensitive Rate Limiter
// ==========================================================

const merchantSensitiveRateLimiter = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Merchant Authentication
        // ==================================================

        const merchantId =
            Number(
                req.merchant?.merchant_id ||
                req.user?.merchant_id ||
                req.user?.merchantId
            );


        if (
            !Number.isInteger(
                merchantId
            ) ||
            merchantId <= 0
        ) {

            return res.status(401).json({

                success: false,

                code:
                    "MERCHANT_AUTH_REQUIRED",

                message:
                    "Merchant authentication is required."

            });

        }


        // ==================================================
        // IP
        // ==================================================

        const ip =
            req.ip ||
            req.socket?.remoteAddress ||
            "unknown";


        const normalizedIp =
            String(ip)
                .replace(
                    /^::ffff:/,
                    ""
                );


        // ==================================================
        // Redis Keys
        // ==================================================

        const ipKey =
            `rl:merchant:sensitive:ip:${normalizedIp}`;

        const merchantKey =
            `rl:merchant:sensitive:merchant:${merchantId}`;


        // ==================================================
        // Increment
        // ==================================================

        const [
            ipCount,
            merchantCount
        ] = await Promise.all([

            incrementCounter(
                ipKey
            ),

            incrementCounter(
                merchantKey
            )

        ]);


        // ==================================================
        // Rate Limit Check
        // ==================================================

        if (
            ipCount > MAX_REQUESTS ||
            merchantCount > MAX_REQUESTS
        ) {

            const [
                ipTtl,
                merchantTtl
            ] = await Promise.all([

                redis.ttl(
                    ipKey
                ),

                redis.ttl(
                    merchantKey
                )

            ]);


            const retryAfter =
                Math.max(
                    ipTtl,
                    merchantTtl,
                    1
                );


            return res
                .status(429)
                .set(
                    "Retry-After",
                    String(
                        retryAfter
                    )
                )
                .json({

                    success: false,

                    code:
                        "MERCHANT_SENSITIVE_RATE_LIMIT_EXCEEDED",

                    message:
                        "Too many sensitive requests. Please try again later.",

                    retryAfter

                });

        }


        // ==================================================
        // Headers
        // ==================================================

        const remaining =
            Math.max(

                0,

                Math.min(

                    MAX_REQUESTS -
                        ipCount,

                    MAX_REQUESTS -
                        merchantCount

                )

            );


        res.set(
            "X-RateLimit-Limit",
            String(
                MAX_REQUESTS
            )
        );


        res.set(
            "X-RateLimit-Remaining",
            String(
                remaining
            )
        );


        next();


    } catch (error) {

        console.error(
            "Merchant Sensitive Rate Limiter Error:",
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


module.exports = {

    merchantSensitiveRateLimiter

};