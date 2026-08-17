const {
    BadRequestError,
    ConflictError
} = require("../../../utils/errors");


// ==================================================
// Validate Wallet Creation
// ==================================================

const validateWalletCreation = (
    merchantId,
    currency = "INR"
) => {

    // ==========================================
    // Merchant ID
    // ==========================================

    if (
        merchantId === undefined ||
        merchantId === null ||
        merchantId === ""
    ) {

        throw new BadRequestError(
            "Merchant ID is required."
        );

    }

    if (
        !Number.isInteger(
            Number(merchantId)
        ) ||
        Number(merchantId) <= 0
    ) {

        throw new BadRequestError(
            "Invalid merchant ID."
        );

    }

    // ==========================================
    // Currency
    // ==========================================

    validateCurrency(currency);

};


// ==================================================
// Validate Wallet Exists
// ==================================================

const validateWalletExists = (
    wallet
) => {

    if (!wallet) {

        throw new BadRequestError(
            "Wallet not found."
        );

    }

};


// ==================================================
// Validate Wallet Active
// ==================================================

const validateWalletActive = (
    wallet
) => {

    if (
        wallet.wallet_status !== "ACTIVE"
    ) {

        throw new ConflictError(
            "Wallet is not active."
        );

    }

};


// ==================================================
// Validate Wallet Blocked
// ==================================================

const validateWalletBlocked = (
    wallet
) => {

    if (
        wallet.wallet_status === "BLOCKED"
    ) {

        throw new ConflictError(
            "Wallet is already blocked."
        );

    }

};


// ==================================================
// Validate Wallet Unblock
// ==================================================

const validateWalletUnblock = (
    wallet
) => {

    if (
        wallet.wallet_status === "ACTIVE"
    ) {

        throw new ConflictError(
            "Wallet is already active."
        );

    }

};


// ==================================================
// Validate Credit Amount
// ==================================================

const validateCreditAmount = (
    amount
) => {

    if (
        !amount ||
        Number(amount) <= 0
    ) {

        throw new BadRequestError(
            "Credit amount must be greater than zero."
        );

    }

};


// ==================================================
// Validate Debit Amount
// ==================================================

const validateDebitAmount = (
    amount
) => {

    if (
        !amount ||
        Number(amount) <= 0
    ) {

        throw new BadRequestError(
            "Debit amount must be greater than zero."
        );

    }

};


// ==================================================
// Validate Available Balance
// ==================================================

const validateSufficientBalance = (
    availableBalance,
    debitAmount
) => {

    if (
        Number(debitAmount) >
        Number(availableBalance)
    ) {

        throw new ConflictError(
            "Insufficient wallet balance."
        );

    }

};


// ==================================================
// Validate Pending Balance Release
// ==================================================

const validatePendingBalance = (
    pendingBalance
) => {

    if (
        Number(pendingBalance) <= 0
    ) {

        throw new ConflictError(
            "No pending balance available for release."
        );

    }

};


// ==================================================
// Validate Merchant Ownership
// ==================================================

const validateWalletOwnership = (
    merchantId,
    wallet
) => {

    if (
        Number(wallet.merchant_id) !==
        Number(merchantId)
    ) {

        throw new ConflictError(
            "Wallet does not belong to merchant."
        );

    }

};


// ==================================================
// Validate Currency
// ==================================================

const validateCurrency = (
    currency
) => {

    const allowedCurrencies = [
        "INR"
    ];

    if (
        !allowedCurrencies.includes(currency)
    ) {

        throw new BadRequestError(
            "Unsupported wallet currency."
        );

    }

};


// ==================================================
// Export
// ==================================================

module.exports = {

    validateWalletCreation,

    validateWalletExists,

    validateWalletActive,

    validateWalletBlocked,

    validateWalletUnblock,

    validateCreditAmount,

    validateDebitAmount,

    validateSufficientBalance,

    validatePendingBalance,

    validateWalletOwnership,

    validateCurrency

};