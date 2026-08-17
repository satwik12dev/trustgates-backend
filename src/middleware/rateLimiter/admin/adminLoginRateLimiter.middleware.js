const rateLimit = require("express-rate-limit");

const adminLoginRateLimiter = rateLimit({

    // ==========================================
    // 1 Minute Window
    // ==========================================

    windowMs: 60 * 1000,


    // ==========================================
    // Maximum Requests
    // ==========================================

    max: 10,


    // ==========================================
    // Don't Count Successful Requests
    // ==========================================

    skipSuccessfulRequests: true,


    // ==========================================
    // Standard Headers
    // ==========================================

    standardHeaders: true,

    legacyHeaders: false,


    // ==========================================
    // Response
    // ==========================================

    message: {

        success: false,

        code: "ADMIN_LOGIN_RATE_LIMITED",

        message:
            "Too many login attempts. Please try again later."

    },


    // ==========================================
    // Handler
    // ==========================================

    handler: (req, res) => {

        return res.status(429).json({

            success: false,

            code:
                "ADMIN_LOGIN_RATE_LIMITED",

            message:
                "Too many login requests. Please try again later."

        });

    }

});

module.exports =  adminLoginRateLimiter
