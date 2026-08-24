const redis = require("../../../config/redis");


// ==========================================================
// Merchant Login Rate Limiter
// ==========================================================
//
// Production:
// 3 attempts / minute
// 4th attempt -> 5 minute cooldown
//
// Load Testing:
// 100 attempts / minute
//
// Key:
// IP + normalized email
//
// ==========================================================


const PRODUCTION_LIMIT = 3;

const LOAD_TEST_LIMIT = 100;

const WINDOW_SECONDS = 60;

const COOLDOWN_SECONDS = 300;


// ==========================================================
// Middleware
// ==========================================================

const loginRateLimiter = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Normalize Email
        // ==================================================

        const email =
            String(
                req.body?.email || ""
            )
                .trim()
                .toLowerCase();


        // ==================================================
        // Get Client IP
        // ==================================================

        const ip =
            req.ip ||
            req.headers["x-forwarded-for"] ||
            "unknown";


        // ==================================================
        // Skip If Email Missing
        // ==================================================

        if (!email) {

            return next();

        }


        // ==================================================
        // Redis Keys
        // ==================================================

        const key =
            `rate-limit:login:${ip}:${email}`;

        const cooldownKey =
            `rate-limit:login-cooldown:${ip}:${email}`;


        // ==================================================
        // Load Testing Mode
        // ==================================================

        const isLoadTesting =
            process.env.LOAD_TESTING === "true";


        const maxAttempts =
            isLoadTesting
                ? LOAD_TEST_LIMIT
                : PRODUCTION_LIMIT;


        // ==================================================
        // Check Existing Cooldown
        // ==================================================

        const cooldown =
            await redis.get(
                cooldownKey
            );


        if (cooldown) {

            const ttl =
                await redis.ttl(
                    cooldownKey
                );


            return res.status(429).json({

                success: false,

                message:
                    "Too many login requests. Please try again later.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : COOLDOWN_SECONDS

            });

        }


        // ==================================================
        // Increment Request Counter
        // ==================================================

        const count =
            await redis.incr(
                key
            );


        // ==================================================
        // First Request
        // Start 60 Second Window
        // ==================================================

        if (count === 1) {

            await redis.expire(
                key,
                WINDOW_SECONDS
            );

        }


        // ==================================================
        // Limit Exceeded
        // ==================================================

        if (
            count > maxAttempts
        ) {

            // Remove current counter
            await redis.del(
                key
            );


            // Start 5 minute cooldown
            await redis.set(
                cooldownKey,
                "1",
                {
                    EX:
                        COOLDOWN_SECONDS
                }
            );


            return res.status(429).json({

                success: false,

                message:
                    "Too many login requests. Please try again after 5 minutes.",

                retryAfter:
                    COOLDOWN_SECONDS

            });

        }


        // ==================================================
        // Continue
        // ==================================================

        return next();


    } catch (error) {

        console.error(
            "Login Rate Limiter Error:",
            error
        );


        // ==================================================
        // Fail Open
        // Redis failure should NOT break login
        // ==================================================

        return next();

    }

};


module.exports = {

    loginRateLimiter

};