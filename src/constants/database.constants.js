// ==========================================================
// Merchant Account Status
// ==========================================================

const ACCOUNT_STATUS = Object.freeze({

    PENDING: "PENDING",

    ACTIVE: "ACTIVE",

    SUSPENDED: "SUSPENDED",

    REJECTED: "REJECTED",

    INACTIVE: "INACTIVE"

});

// ==========================================================
// Merchant Approval Status
// ==========================================================

const APPROVAL_STATUS = Object.freeze({

    PENDING: "PENDING",

    APPROVED: "APPROVED",

    REJECTED: "REJECTED"

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
// API Credential Status
// ==========================================================

const API_STATUS = Object.freeze({

    ACTIVE: "ACTIVE",

    INACTIVE: "INACTIVE",

    REVOKED: "REVOKED"

});

// ==========================================================
// IP Whitelist Status
// ==========================================================

const IP_STATUS = Object.freeze({

    ACTIVE: "ACTIVE",

    INACTIVE: "INACTIVE"

});

// ==========================================================
// Payment Method Status
// ==========================================================

const PAYMENT_METHOD_STATUS = Object.freeze({

    ENABLED: "ENABLED",

    DISABLED: "DISABLED"

});

// ==========================================================
// Transaction Status
// ==========================================================

const TRANSACTION_STATUS = Object.freeze({

    CREATED: "CREATED",

    PENDING: "PENDING",

    AUTHORIZED: "AUTHORIZED",

    SUCCESS: "SUCCESS",

    FAILED: "FAILED",

    CANCELLED: "CANCELLED",

    REFUNDED: "REFUNDED",

    EXPIRED: "EXPIRED"

});

// ==========================================================
// Refund Status
// ==========================================================

const REFUND_STATUS = Object.freeze({

    PENDING: "PENDING",

    PROCESSING: "PROCESSING",

    SUCCESS: "SUCCESS",

    FAILED: "FAILED"

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
// Payout Status
// ==========================================================

const PAYOUT_STATUS = Object.freeze({

    CREATED: "CREATED",

    QUEUED: "QUEUED",

    PROCESSING: "PROCESSING",

    SUCCESS: "SUCCESS",

    FAILED: "FAILED",

    REVERSED: "REVERSED",

    CANCELLED: "CANCELLED"

});

// ==========================================================
// Beneficiary Status
// ==========================================================

const BENEFICIARY_STATUS = Object.freeze({

    PENDING: "PENDING",

    VERIFIED: "VERIFIED",

    ACTIVE: "ACTIVE",

    INACTIVE: "INACTIVE"

});

// ==========================================================
// Webhook Status
// ==========================================================

const WEBHOOK_STATUS = Object.freeze({

    RECEIVED: "RECEIVED",

    VERIFIED: "VERIFIED",

    PROCESSED: "PROCESSED",

    FAILED: "FAILED"

});

// ==========================================================
// Common Database Flags
// ==========================================================

const DB_FLAG = Object.freeze({

    YES: 1,

    NO: 0

});

// ==========================================================
// Export
// ==========================================================

module.exports = {

    ACCOUNT_STATUS,

    APPROVAL_STATUS,

    KYC_STATUS,

    API_STATUS,

    IP_STATUS,

    PAYMENT_METHOD_STATUS,

    TRANSACTION_STATUS,

    REFUND_STATUS,

    SETTLEMENT_STATUS,

    PAYOUT_STATUS,

    BENEFICIARY_STATUS,

    WEBHOOK_STATUS,

    DB_FLAG

};