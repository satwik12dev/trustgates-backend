const {
    BadRequestError,
    ConflictError,
    UnauthorizedError
} = require(
    "../../utils/errors"
);

const {
    WALLET_STATUS
} = require(
    "../../constants/wallet.constants"
);


// ==================================================
// Validate Positive Amount
// ==================================================

const validatePositiveAmount = (
    amount,
    message
) => {

    if (
        amount === undefined ||
        amount === null ||
        amount === "" ||
        !Number.isFinite(
            Number(amount)
        ) ||
        Number(amount) <= 0
    ) {

        throw new BadRequestError(
            message
        );

    }

    return Number(amount);

};


// ==================================================
// Validate Merchant ID
// ==================================================

const validateMerchantId = (
    merchantId
) => {

    const id =
        Number(merchantId);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {

        throw new BadRequestError(
            "Invalid merchant id."
        );

    }

    return id;

};


// ==================================================
// Validate Wallet ID
// ==================================================

const validateWalletId = (
    walletId
) => {

    const id =
        Number(walletId);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {

        throw new BadRequestError(
            "Invalid wallet id."
        );

    }

    return id;

};


// ==================================================
// Validate Wallet Creation
// ==================================================

const validateWalletCreation = (
    merchantId
) => {

    return validateMerchantId(
        merchantId
    );

};


// ==================================================
// Validate Wallet Exists
// ==================================================

const validateWalletExists = (
    wallet
) => {

    if (
        !wallet
    ) {

        throw new BadRequestError(
            "Wallet not found."
        );

    }

    return wallet;

};


// ==================================================
// Validate Wallet Active
// ==================================================

const validateWalletActive = (
    wallet
) => {

    validateWalletExists(
        wallet
    );

    if (
        wallet.wallet_status !==
        WALLET_STATUS.ACTIVE
    ) {

        throw new ConflictError(
            "Wallet is not active."
        );

    }

    return true;

};


// ==================================================
// Validate Wallet Ownership
// ==================================================

const validateWalletOwnership = (
    merchantId,
    wallet
) => {

    const normalizedMerchantId =
        validateMerchantId(
            merchantId
        );

    validateWalletExists(
        wallet
    );

    if (
        Number(wallet.merchant_id) !==
        normalizedMerchantId
    ) {

        throw new UnauthorizedError(
            "Wallet does not belong to merchant."
        );

    }

    return true;

};


// ==================================================
// Validate Credit Amount
// ==================================================

const validateCreditAmount = (
    amount
) => {

    return validatePositiveAmount(
        amount,
        "Credit amount must be greater than zero."
    );

};


// ==================================================
// Validate Debit Amount
// ==================================================

const validateDebitAmount = (
    amount
) => {

    return validatePositiveAmount(
        amount,
        "Debit amount must be greater than zero."
    );

};


// ==================================================
// Validate Sufficient Balance
// ==================================================

const validateSufficientBalance = (
    availableBalance,
    debitAmount
) => {

    const balance =
        Number(availableBalance);

    const amount =
        validateDebitAmount(
            debitAmount
        );


    if (
        !Number.isFinite(balance) ||
        balance < 0
    ) {

        throw new ConflictError(
            "Invalid wallet balance."
        );

    }


    if (
        amount > balance
    ) {

        throw new ConflictError(
            "Insufficient wallet balance."
        );

    }

    return true;

};


// ==================================================
// Validate Pending Balance
// ==================================================

const validatePendingBalance = (
    pendingBalance
) => {

    const balance =
        Number(pendingBalance);

    if (
        !Number.isFinite(balance) ||
        balance <= 0
    ) {

        throw new ConflictError(
            "No pending balance available."
        );

    }

    return true;

};


// ==================================================
// Validate Block Amount
// ==================================================

const validateBlockAmount = (
    availableBalance,
    amount
) => {

    const balance =
        Number(availableBalance);

    const normalizedAmount =
        validatePositiveAmount(
            amount,
            "Block amount must be greater than zero."
        );


    if (
        !Number.isFinite(balance) ||
        balance < 0
    ) {

        throw new ConflictError(
            "Invalid available wallet balance."
        );

    }


    if (
        normalizedAmount > balance
    ) {

        throw new ConflictError(
            "Block amount exceeds available balance."
        );

    }

    return true;

};


// ==================================================
// Validate Unblock Amount
// ==================================================

const validateUnblockAmount = (
    blockedBalance,
    amount
) => {

    const balance =
        Number(blockedBalance);

    const normalizedAmount =
        validatePositiveAmount(
            amount,
            "Unblock amount must be greater than zero."
        );


    if (
        !Number.isFinite(balance) ||
        balance < 0
    ) {

        throw new ConflictError(
            "Invalid blocked wallet balance."
        );

    }


    if (
        normalizedAmount > balance
    ) {

        throw new ConflictError(
            "Unblock amount exceeds blocked balance."
        );

    }

    return true;

};


// ==================================================
// Validate Idempotency Key
// ==================================================

const validateIdempotencyKey = (
    key
) => {

    if (
        typeof key !== "string" ||
        key.trim().length === 0
    ) {

        throw new BadRequestError(
            "Idempotency key is required."
        );

    }


    const normalizedKey =
        key.trim();


    if (
        normalizedKey.length > 100
    ) {

        throw new BadRequestError(
            "Idempotency key must not exceed 100 characters."
        );

    }


    return normalizedKey;

};


// ==================================================
// Validate Pagination
// ==================================================

const validatePagination = (
    page = 1,
    limit = 20
) => {

    const normalizedPage =
        Number(page);

    const normalizedLimit =
        Number(limit);


    if (
        !Number.isSafeInteger(
            normalizedPage
        ) ||
        normalizedPage <= 0
    ) {

        throw new BadRequestError(
            "Invalid page number."
        );

    }


    if (
        !Number.isSafeInteger(
            normalizedLimit
        ) ||
        normalizedLimit <= 0 ||
        normalizedLimit > 100
    ) {

        throw new BadRequestError(
            "Invalid limit. Maximum limit is 100."
        );

    }


    return {

        page:
            normalizedPage,

        limit:
            normalizedLimit,

        offset:
            (
                normalizedPage - 1
            ) *
            normalizedLimit

    };

};


// ==================================================
// Validate Wallet Status
// ==================================================

const validateWalletStatus = (
    status
) => {

    if (
        !Object.values(
            WALLET_STATUS
        ).includes(status)
    ) {

        throw new BadRequestError(
            "Invalid wallet status."
        );

    }

    return status;

};


// ==================================================
// Export
// ==================================================

module.exports = {

    validateMerchantId,

    validateWalletId,

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

    validatePagination,

    validateWalletStatus

};