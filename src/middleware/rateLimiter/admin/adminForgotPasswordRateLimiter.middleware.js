const crypto = require("crypto");

const redis = require("../../../config/redis");


const WINDOW_SECONDS = 15 * 60;

const MAX_IP_REQUESTS = 5;
const MAX_EMAIL_REQUESTS = 3;


const hashValue = (value) => {

    return crypto
        .createHash("sha256")
        .update(String(value))
        .digest("hex");
};


const incrementCounter = async (key) => {

    const count =
        await redis.incr(key);

    if (count === 1) {

        await redis.expire(
            key,
            WINDOW_SECONDS
        );
    }

    return count;
};


const adminForgotPasswordRateLimiter = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // IP
        // ==================================================

        const ip =
            req.ip ||
            req.socket?.remoteAddress ||
            "unknown";


        const normalizedIp =
            String(ip)
                .replace(/^::ffff:/, "");


        const ipKey =
            `rl:admin:forgot-password:ip:${hashValue(normalizedIp)}`;


        const ipCount =
            await incrementCounter(
                ipKey
            );


        if (
            ipCount >
            MAX_IP_REQUESTS
        ) {

            const ttl =
                await redis.ttl(
                    ipKey
                );


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
                        "ADMIN_FORGOT_PASSWORD_RATE_LIMITED",

                    message:
                        "Too many password reset requests. Please try again later.",

                    retryAfter

                });
        }


        // ==================================================
        // Email
        // ==================================================

        const email =
            typeof req.body?.email === "string"
                ? req.body.email
                    .trim()
                    .toLowerCase()
                : null;


        if (email) {

            const emailKey =
                `rl:admin:forgot-password:email:${hashValue(email)}`;


            const emailCount =
                await incrementCounter(
                    emailKey
                );


            if (
                emailCount >
                MAX_EMAIL_REQUESTS
            ) {

                const ttl =
                    await redis.ttl(
                        emailKey
                    );


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
                            "ADMIN_FORGOT_PASSWORD_RATE_LIMITED",

                        message:
                            "Too many password reset requests. Please try again later.",

                        retryAfter

                    });
            }
        }


        // ==================================================
        // Headers
        // ==================================================

        res.set(
            "X-RateLimit-Limit",
            String(MAX_IP_REQUESTS)
        );

        res.set(
            "X-RateLimit-Remaining",
            String(
                Math.max(
                    0,
                    MAX_IP_REQUESTS -
                    ipCount
                )
            )
        );


        next();


    } catch (error) {

        console.error(
            "Admin Forgot Password Rate Limiter Error:",
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
    adminForgotPasswordRateLimiter;