const rateLimit = require("express-rate-limit");
const NodeCache = require("node-cache");
const redis = require("../config/redis");

// Local cache with automatic expiration
const blockedIpCache = new NodeCache({
    stdTTL: Number(process.env.IP_BLOCK_DURATION || 3600),
    checkperiod: 120,
    useClones: false
});

const BLOCK_DURATION = Number(process.env.IP_BLOCK_DURATION || 3600);

/**
 * Check whether an IP is blocked
 */
const ipCheckMiddleware = async (req, res, next) => {
    try {
        const ip = req.ip;
        // Local cache lookup
        if (blockedIpCache.has(ip)) {
            return res.status(403).json({
                success: false,
                message: "Your IP address has been temporarily blocked."
            });
        }
        // Redis lookup
        if (redis.isReady) {
            const blocked = await redis.get(`blocked-ip:${ip}`);

            if (blocked) {
                blockedIpCache.set(ip, true);

                return res.status(403).json({
                    success: false,
                    message: "Your IP address has been temporarily blocked."
                });
            }
        }

        next();
    } catch (err) {
        console.error("IP Check Error:", err);
        next();
    }
};

/**
 * Universal API Rate Limiter
 */
const apiRateLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW || 5) * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX || 100),

    standardHeaders: true,
    legacyHeaders: false,

    handler: async (req, res) => {
        const ip = req.ip;

        console.warn(`[RATE LIMIT] ${ip} exceeded limit.`);

        blockedIpCache.set(ip, true);

        if (redis.isReady) {
            try {
                await redis.set(
                    `blocked-ip:${ip}`,
                    "1",
                    {
                        EX: BLOCK_DURATION
                    }
                );
            } catch (err) {
                console.error("Redis Error:", err);
            }
        }
        return res.status(429).json({
            success: false,
            message: `Too many requests. Your IP has been blocked for ${BLOCK_DURATION / 60} minutes.`
        });
    }
});

module.exports = {
    ipCheckMiddleware,
    apiRateLimiter
};