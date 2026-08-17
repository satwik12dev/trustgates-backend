const redis = require("../../../config/redis");


// ==========================================================
// Merchant Login Rate Limiter
// ==========================================================
//
// 3 attempts / minute
// 4th attempt → 5 minute cooldown
//
// Key is based on:
// IP + normalized email
//
// ==========================================================

const loginRateLimiter = async (req, res, next) => {

    try {

        const email =
            String(req.body.email || "")
                .trim()
                .toLowerCase();

        const ip =
            req.ip ||
            req.headers["x-forwarded-for"] ||
            "unknown";


        if (!email) {
            return next();
        }


        const key =
            `rate-limit:login:${ip}:${email}`;

        const cooldownKey =
            `rate-limit:login-cooldown:${ip}:${email}`;


        // ==================================================
        // Check existing cooldown
        // ==================================================

        const cooldown =
            await redis.get(cooldownKey);


        if (cooldown) {

            const ttl =
                await redis.ttl(cooldownKey);

            return res.status(429).json({

                success: false,

                message:
                    "Too many login requests. Please try again later.",

                retryAfter:
                    ttl > 0 ? ttl : 300

            });

        }


        // ==================================================
        // Count requests
        // ==================================================

        const count =
            await redis.incr(key);


        // First request → 60 sec window
        if (count === 1) {

            await redis.expire(
                key,
                60
            );

        }


        // ==================================================
        // More than 3 requests
        // ==================================================

        if (count > 3) {

            // Remove current minute counter
            await redis.del(key);


            // 5 minute cooldown
            await redis.set(
                cooldownKey,
                "1",
                {
                    EX: 300
                }
            );


            return res.status(429).json({

                success: false,

                message:
                    "Too many login requests. Please try again after 5 minutes.",

                retryAfter: 300

            });

        }


        next();

    } catch (error) {

        console.error(
            "Login Rate Limiter Error:",
            error
        );

        next();
    }
};


module.exports = {
    loginRateLimiter
};