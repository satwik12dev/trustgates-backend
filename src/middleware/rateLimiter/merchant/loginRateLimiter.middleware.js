const redis = require("../../../config/redis");

// ==========================================================
// Merchant Login Rate Limiter
// ==========================================================
//
// Production:
// 3 attempts / minute
// 4th attempt -> 5 minute cooldown
//
// Load testing:
// Higher limit so backend capacity can be measured
//
// ==========================================================

const PRODUCTION_LIMIT = 3;
const LOAD_TEST_LIMIT = 100;
const WINDOW_SECONDS = 60;
const COOLDOWN_SECONDS = 300;

const loginRateLimiter = async (req, res, next) => {
    try {

        const email = String(req.body.email || "")
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
        // Select limit
        // ==================================================

        const isLoadTesting =
            process.env.LOAD_TESTING === "true";

        const maxAttempts =
            isLoadTesting
                ? LOAD_TEST_LIMIT
                : PRODUCTION_LIMIT;

        // ==================================================
        // Check cooldown
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
                    ttl > 0
                        ? ttl
                        : COOLDOWN_SECONDS
            });
        }

        // ==================================================
        // Count requests
        // ==================================================

        const count =
            await redis.incr(key);

        // First request -> start 60 second window
        if (count === 1) {

            await redis.expire(
                key,
                WINDOW_SECONDS
            );
        }

        // ==================================================
        // Limit exceeded
        // ==================================================

        if (count > maxAttempts) {

            await redis.del(key);

            await redis.set(
                cooldownKey,
                "1",
                {
                    EX: COOLDOWN_SECONDS
                }
            );

            return res.status(429).json({
                success: false,
                message:
                    "Too many login requests. Please try again later.",
                retryAfter: COOLDOWN_SECONDS
            });
        }

        next();

    } catch (error) {

        console.error(
            "Login Rate Limiter Error:",
            error
        );

        // Fail-open so Redis failure doesn't
        // make login completely unavailable.
        next();
    }
};

module.exports = {
    loginRateLimiter
};
