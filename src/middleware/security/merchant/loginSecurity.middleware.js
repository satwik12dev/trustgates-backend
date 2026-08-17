const redis = require("../../../config/redis");

const ACCOUNT_WINDOW = 12 * 60 * 60; // 12 hours
const TWELVE_HOURS = 12 * 60 * 60;


// ==========================================================
// Normalize Email
// ==========================================================

const normalizeEmail = (email) => {
    return String(email || "")
        .trim()
        .toLowerCase();
};


// ==========================================================
// Account Security Keys
// ==========================================================

const getAccountKeys = (email) => {

    const normalizedEmail =
        normalizeEmail(email);

    return {
        attemptsKey:
            `login:failed:${normalizedEmail}`,

        blockKey:
            `login:block:${normalizedEmail}`
    };
};


// ==========================================================
// Check 12-Hour Account Block
// ==========================================================

const checkLoginBlock = async (
    req,
    res,
    next
) => {

    try {

        const email =
            normalizeEmail(req.body.email);

        if (!email) {
            return next();
        }

        const { blockKey } =
            getAccountKeys(email);

        const blocked =
            await redis.get(blockKey);

        if (!blocked) {
            return next();
        }

        const ttl =
            await redis.ttl(blockKey);

        return res.status(423).json({

            success: false,

            message:
                "Too many incorrect password attempts. Login has been blocked for 12 hours.",

            retryAfter:
                ttl > 0
                    ? ttl
                    : TWELVE_HOURS

        });

    } catch (error) {

        console.error(
            "Login Block Check Error:",
            error
        );

        return next();
    }
};


// ==========================================================
// Record Failed Login
// ==========================================================

const recordFailedLogin = async (
    email
) => {

    const {
        attemptsKey,
        blockKey
    } = getAccountKeys(email);


    const attempts =
        await redis.incr(attemptsKey);


    // Keep failed-attempt counter for 12 hours
    if (attempts === 1) {

        await redis.expire(
            attemptsKey,
            ACCOUNT_WINDOW
        );
    }


    // ======================================================
    // 5 WRONG PASSWORDS → 12 HOUR BLOCK
    // ======================================================

    if (attempts >= 5) {

        await redis.set(
            blockKey,
            "12h",
            {
                EX: TWELVE_HOURS
            }
        );


        await redis.del(
            attemptsKey
        );


        return {

            blocked: true,

            attempts,

            retryAfter:
                TWELVE_HOURS

        };
    }


    return {

        blocked: false,

        attempts,

        remainingAttempts:
            5 - attempts

    };
};


// ==========================================================
// Successful Login
// ==========================================================

const clearFailedLogin = async (
    email
) => {

    const {
        attemptsKey
    } = getAccountKeys(email);


    await redis.del(
        attemptsKey
    );
};


module.exports = {

    checkLoginBlock,

    recordFailedLogin,

    clearFailedLogin

};