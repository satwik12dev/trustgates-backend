// ==================================================
// Wallet Status
// ==================================================

const WALLET_STATUS = {
    ACTIVE: "ACTIVE",
    BLOCKED: "BLOCKED",
    SUSPENDED: "SUSPENDED"
};

const WALLET_TRANSACTION_TYPE = {
    CREDIT: "CREDIT",
    DEBIT: "DEBIT"
};

const WALLET_SOURCE = {
    PAYMENT: "PAYMENT",
    REFUND: "REFUND",
    SETTLEMENT: "SETTLEMENT",
    FEE: "FEE",
    ADJUSTMENT: "ADJUSTMENT"
};

const WALLET_LEDGER_STATUS = {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",

    FAILED: "FAILED",

    REVERSED: "REVERSED"

};



// ==================================================
// Wallet Balance Type
// ==================================================

const WALLET_BALANCE_TYPE = {

    AVAILABLE: "AVAILABLE",

    PENDING: "PENDING",

    BLOCKED: "BLOCKED"

};



// ==================================================
// Wallet Performer Type
// ==================================================

const WALLET_PERFORMER_TYPE = {

    MERCHANT: "MERCHANT",

    ADMIN: "ADMIN",

    SYSTEM: "SYSTEM"

};



// ==================================================
// Wallet Reference Type
// ==================================================

const WALLET_REFERENCE_TYPE = {

    PAYMENT: "PAYMENT",

    REFUND: "REFUND",

    SETTLEMENT: "SETTLEMENT",

    FEE: "FEE",

    ADJUSTMENT: "ADJUSTMENT"

};



// ==================================================
// Export
// ==================================================

module.exports = {


    WALLET_STATUS,


    WALLET_TRANSACTION_TYPE,


    WALLET_SOURCE,


    WALLET_LEDGER_STATUS,


    WALLET_BALANCE_TYPE,


    WALLET_PERFORMER_TYPE,


    WALLET_REFERENCE_TYPE


};