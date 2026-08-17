const WALLET_LEDGER_QUERIES = require(
    "../../../queries/wallet/walletLedger.query"
);

const {
    validateLedgerEntry,
    validateTransactionType,
    validateLedgerSource,
    validateReferenceType,
    validateLedgerStatus
} = require(
    "../../../validations/wallet/walletLedger.validation"
);


// ==========================================================
// Create Ledger Entry
// ==========================================================
//
// Financial record:
//
// amount       = actual transaction amount
// feeAmount    = applicable fee
// totalAmount  = amount + feeAmount
//
// Example:
//
// amount       = 1000
// feeAmount    = 20
// totalAmount  = 1020
//
// ==========================================================

const createLedgerEntry = async (
    connection,
    data
) => {

    const {
        walletId,
        merchantId,
        transactionType,
        source,

        amount,

        feeAmount = 0,

        totalAmount,

        balanceBefore,
        balanceAfter,

        referenceType,
        referenceId,

        idempotencyKey,

        status,

        description,

        metadata = {}

    } = data;


    // ======================================================
    // Normalize Amounts
    // ======================================================

    const normalizedAmount =
        Number(amount);


    const normalizedFeeAmount =
        Number(feeAmount);


    const normalizedTotalAmount =
        totalAmount !== undefined &&
        totalAmount !== null

            ? Number(totalAmount)

            : normalizedAmount +
              normalizedFeeAmount;


    // ======================================================
    // Validate Amounts
    // ======================================================

    if (
        !Number.isFinite(normalizedAmount) ||
        normalizedAmount <= 0
    ) {

        throw new Error(
            "Invalid ledger amount."
        );

    }


    if (
        !Number.isFinite(normalizedFeeAmount) ||
        normalizedFeeAmount < 0
    ) {

        throw new Error(
            "Invalid ledger fee amount."
        );

    }


    if (
        !Number.isFinite(normalizedTotalAmount) ||
        normalizedTotalAmount <= 0
    ) {

        throw new Error(
            "Invalid ledger total amount."
        );

    }


    // ======================================================
    // Ensure Total = Amount + Fee
    // ======================================================

    const expectedTotal =
        normalizedAmount +
        normalizedFeeAmount;


    if (
        Math.abs(
            normalizedTotalAmount -
            expectedTotal
        ) > 0.0001
    ) {

        throw new Error(
            "Ledger total amount must equal amount + fee amount."
        );

    }


    // ======================================================
    // Validate Ledger Entry
    // ======================================================

    validateLedgerEntry({

        walletId,

        merchantId,

        amount:
            normalizedAmount,

        referenceType,

        referenceId,

        idempotencyKey

    });


    // ======================================================
    // Validate Enums
    // ======================================================

    validateTransactionType(
        transactionType
    );


    validateLedgerSource(
        source
    );


    validateReferenceType(
        referenceType
    );


    validateLedgerStatus(
        status
    );


    // ======================================================
    // Insert Ledger Entry
    // ======================================================

    const [
        result
    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .CREATE_LEDGER_ENTRY,

        [

            walletId,

            merchantId,

            transactionType,

            source,

            normalizedAmount,

            normalizedFeeAmount,

            normalizedTotalAmount,

            balanceBefore,

            balanceAfter,

            referenceType,

            referenceId,

            idempotencyKey,

            status,

            description,

            JSON.stringify(metadata)

        ]

    );


    return result.insertId;

};


// ==========================================================
// Check Idempotency
// ==========================================================

const getLedgerByIdempotencyKey = async (
    connection,
    idempotencyKey
) => {

    if (
        !idempotencyKey
    ) {

        return null;

    }


    const [
        rows
    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .CHECK_IDEMPOTENCY_KEY,

        [
            idempotencyKey
        ]

    );


    return rows.length
        ? rows[0]
        : null;

};


// ==========================================================
// Get Wallet Ledger
// ==========================================================

const getWalletLedger = async (
    connection,
    {
        walletId,
        limit = 20,
        offset = 0
    }
) => {

    const [
        rows
    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .GET_WALLET_LEDGER,

        [

            walletId,

            Number(limit),

            Number(offset)

        ]

    );


    return rows;

};


// ==========================================================
// Get Merchant Ledger
// ==========================================================

const getMerchantLedger = async (
    connection,
    {
        merchantId,
        limit = 20,
        offset = 0
    }
) => {

    const [
        rows
    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .GET_MERCHANT_LEDGER,

        [

            merchantId,

            Number(limit),

            Number(offset)

        ]

    );


    return rows;

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    createLedgerEntry,

    getLedgerByIdempotencyKey,

    getWalletLedger,

    getMerchantLedger

};