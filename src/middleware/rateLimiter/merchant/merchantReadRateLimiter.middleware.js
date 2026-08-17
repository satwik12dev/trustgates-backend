const redis =
    require("../../../config/redis");


// ==========================================================
// Merchant Read Rate Limiter
// ==========================================================
//
// Limit:
// 120 GET/read requests / minute
//
// Protection:
// IP + Merchant ID
//
// ==========================================================

const WINDOW_SECONDS = 60;

const MAX_REQUESTS = 120;


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
// Merchant Read Rate Limiter
// ==========================================================

const merchantReadRateLimiter = async (
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
            !Number.isInteger(merchantId) ||
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
            `rl:merchant:read:ip:${normalizedIp}`;

        const merchantKey =
            `rl:merchant:read:merchant:${merchantId}`;


        // ==================================================
        // Increment Both Counters
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
                        "MERCHANT_READ_RATE_LIMIT_EXCEEDED",

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
            "Merchant Read Rate Limiter Error:",
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

    merchantReadRateLimiter

};