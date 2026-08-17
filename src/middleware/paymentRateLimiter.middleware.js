const rateLimit = require("express-rate-limit");

const { RedisStore } = require("rate-limit-redis");

const redis = require("../config/redis");

const { ipKeyGenerator } = require("express-rate-limit");

// ==========================================================
// Create Redis Store
// ==========================================================

const createRedisStore = (prefix) => {

    return new RedisStore({

        sendCommand: (...args) => redis.sendCommand(args),

        prefix

    });

};

// ==========================================================
// Common Configuration
// ==========================================================

const commonConfig = {

    standardHeaders: true,

    legacyHeaders: false,

    keyGenerator: (req) => {

        return req.apiCredential?.credential_id

            ? `merchant_${req.apiCredential.credential_id}`

            : ipKeyGenerator(req);

    }

};

// ==========================================================
// Create Order
// ==========================================================

const createOrderLimiter = rateLimit({

    ...commonConfig,

    store: createRedisStore("create-order:"),

    windowMs: 60 * 1000,

    limit: 100,

    message: {

        success: false,

        message: "Create Order rate limit exceeded. Please try again after 1 minute."

    }

});

// ==========================================================
// Verify Payment
// ==========================================================

const verifyPaymentLimiter = rateLimit({

    ...commonConfig,

    store: createRedisStore("verify-payment:"),

    windowMs: 60 * 1000,

    limit: 300,

    message: {

        success: false,

        message: "Too many payment verification requests."

    }

});

// ==========================================================
// Payment Status
// ==========================================================

const paymentStatusLimiter = rateLimit({

    ...commonConfig,

    store: createRedisStore("payment-status:"),

    windowMs: 60 * 1000,

    limit: 200,

    message: {

        success: false,

        message: "Too many payment status requests."

    }

});

// ==========================================================
// Refund
// ==========================================================

const refundLimiter = rateLimit({

    ...commonConfig,

    store: createRedisStore("refund:"),

    windowMs: 60 * 1000,

    limit: 20,

    message: {

        success: false,

        message: "Refund request limit exceeded."

    }

});

// ==========================================================
// Webhook
// ==========================================================

const webhookLimiter = rateLimit({

    ...commonConfig,

    store: createRedisStore("webhook:"),

    windowMs: 60 * 1000,

    limit: 1000,

    message: {

        success: false,

        message: "Webhook rate limit exceeded."

    }

});

// ==========================================================
// Export
// ==========================================================

module.exports = {

    createOrderLimiter,

    verifyPaymentLimiter,

    paymentStatusLimiter,

    refundLimiter,

    webhookLimiter

};