// ==========================================================
// Payment Gateway
// ==========================================================

const PAYMENT_GATEWAY = Object.freeze({

    RAZORPAY: "RAZORPAY",

    CASHFREE: "CASHFREE",

    PHONEPE: "PHONEPE",

    PAYU: "PAYU",

    STRIPE: "STRIPE"

});

// ==========================================================
// Environment
// ==========================================================

const PAYMENT_ENVIRONMENT = Object.freeze({

    TEST: "TEST",

    LIVE: "LIVE"

});

// ==========================================================
// Currency
// ==========================================================

const CURRENCY = Object.freeze({

    INR: "INR"

});

// ==========================================================
// Payment Method
// ==========================================================

const PAYMENT_METHOD = Object.freeze({

    UPI: "UPI",

    CARD: "CARD",

    NETBANKING: "NETBANKING",

    WALLET: "WALLET",

    EMI: "EMI",

    PAYLATER: "PAYLATER"

});

// ==========================================================
// Payment Type
// ==========================================================

const PAYMENT_TYPE = Object.freeze({

    PAYIN: "PAYIN",

    PAYOUT: "PAYOUT"

});

// ==========================================================
// Payment Status
// ==========================================================

const PAYMENT_STATUS = Object.freeze({

    CREATED: "CREATED",

    PENDING: "PENDING",

    AUTHORIZED: "AUTHORIZED",

    SUCCESS: "SUCCESS",

    FAILED: "FAILED",

    CANCELLED: "CANCELLED",

    REFUNDED: "REFUNDED",

    PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",

    CHARGEBACK: "CHARGEBACK",

    SETTLED: "SETTLED"

});

// ==========================================================
// Settlement Status
// ==========================================================

const SETTLEMENT_STATUS = Object.freeze({

    PENDING: "PENDING",

    PROCESSING: "PROCESSING",

    SETTLED: "SETTLED",

    FAILED: "FAILED"

});

// ==========================================================
// Refund Status
// ==========================================================

const REFUND_STATUS = Object.freeze({

    CREATED: "CREATED",

    PROCESSING: "PROCESSING",

    PROCESSED: "PROCESSED",

    FAILED: "FAILED"

});

// ==========================================================
// KYC Status
// ==========================================================

const KYC_STATUS = Object.freeze({

    PENDING: "PENDING",

    APPROVED: "APPROVED",

    REJECTED: "REJECTED"

});

// ==========================================================
// Merchant Status
// ==========================================================

const MERCHANT_STATUS = Object.freeze({

    ACTIVE: "ACTIVE",

    PENDING: "PENDING",

    SUSPENDED: "SUSPENDED",

    BLOCKED: "BLOCKED"

});

// ==========================================================
// API Credential Status
// ==========================================================

const API_CREDENTIAL_STATUS = Object.freeze({

    ACTIVE: "ACTIVE",

    INACTIVE: "INACTIVE",

    REVOKED: "REVOKED"

});

// ==========================================================
// Configuration
// ==========================================================

const PAYMENT_CONFIGURATION = Object.freeze({

    ENABLED: true,

    DISABLED: false

});

// ==========================================================
// Checkout Theme
// ==========================================================

const CHECKOUT_THEME = Object.freeze({

    DEFAULT_COLOR: "#2563EB"

});

// ==========================================================
// Completion Source
// ==========================================================

const COMPLETION_SOURCE = Object.freeze({

    CUSTOMER: "CUSTOMER",

    WEBHOOK: "WEBHOOK",

    ADMIN: "ADMIN",

    SYSTEM: "SYSTEM"

});

// ==========================================================
// Export
// ==========================================================

module.exports = {

    PAYMENT_GATEWAY,

    PAYMENT_ENVIRONMENT,

    CURRENCY,

    PAYMENT_METHOD,

    PAYMENT_TYPE,

    PAYMENT_STATUS,

    SETTLEMENT_STATUS,

    REFUND_STATUS,

    KYC_STATUS,

    MERCHANT_STATUS,

    API_CREDENTIAL_STATUS,

    PAYMENT_CONFIGURATION,

    CHECKOUT_THEME,
    COMPLETION_SOURCE

};