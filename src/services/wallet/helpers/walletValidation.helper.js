const {
    BadRequestError,
    ConflictError,
    UnauthorizedError
} = require(
    "../../../utils/errors"
);


// ==========================================================
// Validate Wallet Creation
// ==========================================================

const validateWalletCreation = (
    merchantId
) => {

    if (
        merchantId === undefined ||
        merchantId === null ||
        !Number.isInteger(Number(merchantId)) ||
        Number(merchantId) <= 0
    ) {

        throw new BadRequestError(
            "Valid merchant id is required."
        );

    }

};


// ==========================================================
// Validate Wallet Exists
// ==========================================================

const validateWalletExists = (
    wallet
) => {

    if (!wallet) {

        throw new BadRequestError(
            "Wallet not found."
        );

    }

};


// ==========================================================
// Validate Wallet Active
// ==========================================================

const validateWalletActive = (
    wallet
) => {

    if (!wallet) {

        throw new BadRequestError(
            "Wallet not found."
        );

    }


    if (
        wallet.wallet_status !== "ACTIVE"
    ) {

        throw new ConflictError(
            "Wallet is not active."
        );

    }

};


// ==========================================================
// Validate Wallet Ownership
// ==========================================================

const validateWalletOwnership = (
    merchantId,
    wallet
) => {

    if (!wallet) {

        throw new BadRequestError(
            "Wallet not found."
        );

    }


    if (
        Number(wallet.merchant_id) !==
        Number(merchantId)
    ) {

        throw new UnauthorizedError(
            "Wallet does not belong to merchant."
        );

    }

};


// ==========================================================
// Validate Credit Amount
// ==========================================================

const validateCreditAmount = (
    amount
) => {

    const normalizedAmount =
        Number(amount);


    if (
        amount === undefined ||
        amount === null ||
        !Number.isFinite(normalizedAmount) ||
        normalizedAmount <= 0
    ) {

        throw new BadRequestError(
            "Credit amount must be greater than zero."
        );

    }

};


// ==========================================================
// Validate Debit Amount
// ==========================================================

const validateDebitAmount = (
    amount
) => {

    const normalizedAmount =
        Number(amount);


    if (
        amount === undefined ||
        amount === null ||
        !Number.isFinite(normalizedAmount) ||
        normalizedAmount <= 0
    ) {

        throw new BadRequestError(
            "Debit amount must be greater than zero."
        );

    }

};


// ==========================================================
// Validate Sufficient Balance
// ==========================================================

const validateSufficientBalance = (
    availableBalance,
    debitAmount
) => {

    const balance =
        Number(availableBalance);

    const amount =
        Number(debitAmount);


    if (
        !Number.isFinite(balance) ||
        !Number.isFinite(amount)
    ) {

        throw new BadRequestError(
            "Invalid wallet balance or debit amount."
        );

    }


    if (
        amount > balance
    ) {

        throw new ConflictError(
            "Insufficient wallet balance."
        );

    }

};


// ==========================================================
// Validate Pending Balance
// ==========================================================

const validatePendingBalance = (
    pendingBalance
) => {

    const amount =
        Number(pendingBalance);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        throw new ConflictError(
            "No pending balance available."
        );

    }

};


// ==========================================================
// Validate Block Amount
// ==========================================================

const validateBlockAmount = (
    availableBalance,
    amount
) => {

    const balance =
        Number(availableBalance);

    const blockAmount =
        Number(amount);


    if (
        !Number.isFinite(balance) ||
        !Number.isFinite(blockAmount) ||
        blockAmount <= 0
    ) {

        throw new BadRequestError(
            "Invalid block amount."
        );

    }


    if (
        blockAmount > balance
    ) {

        throw new ConflictError(
            "Block amount exceeds available balance."
        );

    }

};


// ==========================================================
// Validate Unblock Amount
// ==========================================================

const validateUnblockAmount = (
    blockedBalance,
    amount
) => {

    const balance =
        Number(blockedBalance);

    const unblockAmount =
        Number(amount);


    if (
        !Number.isFinite(balance) ||
        !Number.isFinite(unblockAmount) ||
        unblockAmount <= 0
    ) {

        throw new BadRequestError(
            "Invalid unblock amount."
        );

    }


    if (
        unblockAmount > balance
    ) {

        throw new ConflictError(
            "Unblock amount exceeds blocked balance."
        );

    }

};


// ==========================================================
// Validate Idempotency Key
// ==========================================================

const validateIdempotencyKey = (
    key
) => {

    if (
        typeof key !== "string"
    ) {

        throw new BadRequestError(
            "Idempotency key is required."
        );

    }


    const normalizedKey =
        key.trim();


    if (
        !normalizedKey
    ) {

        throw new BadRequestError(
            "Idempotency key is required."
        );

    }


    if (
        normalizedKey.length > 100
    ) {

        throw new BadRequestError(
            "Idempotency key must not exceed 100 characters."
        );

    }


    return normalizedKey;

};


// ==========================================================
// Validate Pagination
// ==========================================================

const validatePagination = (
    page,
    limit
) => {

    if (
        page !== undefined &&
        page !== null
    ) {

        if (
            !Number.isInteger(Number(page)) ||
            Number(page) <= 0
        ) {

            throw new BadRequestError(
                "Invalid page number."
            );

        }

    }


    if (
        limit !== undefined &&
        limit !== null
    ) {

        if (
            !Number.isInteger(Number(limit)) ||
            Number(limit) <= 0
        ) {

            throw new BadRequestError(
                "Invalid limit."
            );

        }

    }

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    validateWalletCreation,

    validateWalletExists,

    validateWalletActive,

    validateWalletOwnership,

    validateCreditAmount,

    validateDebitAmount,

    validateSufficientBalance,

    validatePendingBalance,

    validateBlockAmount,

    validateUnblockAmount,

    validateIdempotencyKey,

    validatePagination

};