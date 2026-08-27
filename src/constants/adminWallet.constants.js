// ==========================================================
// Admin Wallet Constants
// ==========================================================

const ADMIN_WALLET_TRANSACTION_TYPE = Object.freeze({
    CREDIT: "CREDIT",
    DEBIT: "DEBIT"
});

const ADMIN_WALLET_SOURCE = Object.freeze({
    FEE: "FEE",
    ADJUSTMENT: "ADJUSTMENT"
});

const ADMIN_WALLET_STATUS = Object.freeze({
    ACTIVE: "ACTIVE",
    BLOCKED: "BLOCKED"
});

const ADMIN_WALLET_TRANSACTION_STATUS = Object.freeze({
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    REVERSED: "REVERSED"
});

module.exports = {
    ADMIN_WALLET_TRANSACTION_TYPE,
    ADMIN_WALLET_SOURCE,
    ADMIN_WALLET_STATUS,
    ADMIN_WALLET_TRANSACTION_STATUS
};