const crypto = require("crypto");

const redis = require("../../../config/redis");


// ==========================================================
// Security Configuration
// ==========================================================

const MAX_FAILED_ATTEMPTS = 5;

const LOCK_DURATION_SECONDS =
    12 * 60 * 60;


// ==========================================================
// Normalize Email
// ==========================================================

const normalizeEmail = (email) => {

    if (
        typeof email !== "string"
    ) {
        return null;
    }

    const normalized =
        email.trim().toLowerCase();

    return normalized || null;
};


// ==========================================================
// Generate Safe Redis Identifier
// ==========================================================

const getAdminSecurityId = (email) => {

    const normalizedEmail =
        normalizeEmail(email);

    if (!normalizedEmail) {
        return null;
    }

    return crypto
        .createHash("sha256")
        .update(normalizedEmail)
        .digest("hex");
};


// ==========================================================
// Redis Keys
// ==========================================================

const getKeys = (email) => {

    const adminId =
        getAdminSecurityId(email);

    if (!adminId) {
        return null;
    }

    return {

        attempts:
            `admin:login:failed:${adminId}`,

        lock:
            `admin:login:lock:${adminId}`

    };
};


// ==========================================================
// Check Admin Login Block
// ==========================================================

const checkAdminLoginBlock = async (
    req,
    res,
    next
) => {

    try {

        const email =
            normalizeEmail(
                req.body?.email
            );


        if (!email) {

            return next();

        }


        const keys =
            getKeys(email);


        if (!keys) {

            return next();

        }


        const lockExists =
            await redis.exists(
                keys.lock
            );


        if (lockExists) {

            const ttl =
                await redis.ttl(
                    keys.lock
                );


            const remainingMinutes =
                Math.max(
                    1,
                    Math.ceil(
                        ttl / 60
                    )
                );


            return res.status(423).json({

                success: false,

                code:
                    "ADMIN_LOGIN_BLOCKED",

                message:
                    "Admin login is temporarily blocked due to multiple failed login attempts.",

                retryAfterMinutes:
                    remainingMinutes

            });

        }


        next();

    }

    catch (error) {

        console.error(
            "Admin Login Security Check Error:",
            error
        );

        next(error);

    }

};


// ==========================================================
// Record Failed Admin Login
// ==========================================================

const recordFailedAdminLogin = async (
    email
) => {

    const keys =
        getKeys(email);


    if (!keys) {
        return {
            attempts: 0,
            blocked: false
        };
    }


    const attempts =
        await redis.incr(
            keys.attempts
        );


    // Keep failed-attempt key alive
    // for the current protection window.

    if (attempts === 1) {

        await redis.expire(
            keys.attempts,
            LOCK_DURATION_SECONDS
        );

    }


    // ======================================================
    // 5th Failed Attempt
    // ======================================================

    if (
        attempts >=
        MAX_FAILED_ATTEMPTS
    ) {

        await redis.set(
            keys.lock,
            "1",
            {
                EX:
                    LOCK_DURATION_SECONDS
            }
        );


        // Remove attempt counter after lock
        await redis.del(
            keys.attempts
        );


        return {

            attempts,

            blocked: true

        };

    }


    return {

        attempts,

        blocked: false

    };

};


// ==========================================================
// Clear Failed Attempts
// ==========================================================

const clearFailedAdminLoginAttempts = async (
    email
) => {

    const keys =
        getKeys(email);


    if (!keys) {
        return;
    }


    await redis.del(
        keys.attempts
    );

};


module.exports = {

    checkAdminLoginBlock,

    recordFailedAdminLogin,

    clearFailedAdminLoginAttempts

};