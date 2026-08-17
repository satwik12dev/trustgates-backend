const redis = require("../../../config/redis");


// ==========================================================
// Configuration
// ==========================================================

const EMAIL_MAX = 3;
const IP_MAX = 10;

const WINDOW = 60 * 60; // 1 hour


// ==========================================================
// Normalize Email
// ==========================================================

const normalizeEmail = (email) => {

    return String(email || "")
        .trim()
        .toLowerCase();

};


// ==========================================================
// Signup Rate Limiter
// ==========================================================

const signupRateLimiter = async (
    req,
    res,
    next
) => {

    try {

        const email =
            normalizeEmail(
                req.body?.email
            );

        const ip =
            req.ip ||
            "unknown";


        // ==================================================
        // Keys
        // ==================================================

        const emailKey =
            `signup:count:email:${email}`;

        const ipKey =
            `signup:count:ip:${ip}`;


        // ==================================================
        // Email Limit
        // ==================================================

        if (email) {

            const emailCount =
                Number(
                    await redis.get(
                        emailKey
                    )
                ) || 0;


            if (
                emailCount >=
                EMAIL_MAX
            ) {

                const ttl =
                    await redis.ttl(
                        emailKey
                    );


                return res.status(429).json({

                    success: false,

                    message:
                        "Too many signup attempts for this email. Please try again later.",

                    retryAfter:
                        ttl > 0
                            ? ttl
                            : WINDOW

                });

            }

        }


        // ==================================================
        // IP Limit
        // ==================================================

        const ipCount =
            Number(
                await redis.get(
                    ipKey
                )
            ) || 0;


        if (
            ipCount >=
            IP_MAX
        ) {

            const ttl =
                await redis.ttl(
                    ipKey
                );


            return res.status(429).json({

                success: false,

                message:
                    "Too many signup attempts from this network. Please try again later.",

                retryAfter:
                    ttl > 0
                        ? ttl
                        : WINDOW

            });

        }


        // ==================================================
        // Increment Email Counter
        // ==================================================

        if (email) {

            const newEmailCount =
                await redis.incr(
                    emailKey
                );


            if (
                newEmailCount === 1
            ) {

                await redis.expire(
                    emailKey,
                    WINDOW
                );

            }

        }


        // ==================================================
        // Increment IP Counter
        // ==================================================

        const newIpCount =
            await redis.incr(
                ipKey
            );


        if (
            newIpCount === 1
        ) {

            await redis.expire(
                ipKey,
                WINDOW
            );

        }


        next();


    } catch (error) {

        console.error(
            "Signup Rate Limiter Error:",
            error
        );


        // Don't bring signup completely down
        // if Redis temporarily fails.
        return next();

    }

};


module.exports = {
    signupRateLimiter
};