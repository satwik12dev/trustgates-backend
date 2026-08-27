const WALLET_LEDGER_QUERIES = require("../../../queries/wallet/walletLedger.query");

const {
    validateLedgerEntry,
    validateTransactionType,
    validateLedgerSource,
    validateReferenceType,
    validateLedgerStatus
} = require("../../../validations/wallet/walletLedger.validation");

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
    // Validate Amount
    // ======================================================

    if (
        !Number.isFinite(
            normalizedAmount
        ) ||
        normalizedAmount <= 0
    ) {

        throw new Error(
            "Invalid ledger amount."
        );

    }


    // ======================================================
    // Validate Fee
    // ======================================================

    if (
        !Number.isFinite(
            normalizedFeeAmount
        ) ||
        normalizedFeeAmount < 0
    ) {

        throw new Error(
            "Invalid ledger fee amount."
        );

    }


    // ======================================================
    // Validate Total Amount
    // ======================================================

    if (
        !Number.isFinite(
            normalizedTotalAmount
        ) ||
        normalizedTotalAmount <= 0
    ) {

        throw new Error(
            "Invalid ledger total amount."
        );

    }


    // ======================================================
    // Ensure:
    //
    // totalAmount = amount + feeAmount
    //
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
    // Validate Transaction Type
    // ======================================================

    validateTransactionType(
        transactionType
    );


    // ======================================================
    // Validate Source
    // ======================================================

    validateLedgerSource(
        source
    );


    // ======================================================
    // Validate Reference Type
    // ======================================================

    validateReferenceType(
        referenceType
    );


    // ======================================================
    // Validate Status
    // ======================================================

    validateLedgerStatus(
        status
    );


    // ======================================================
    // Create Wallet Transaction
    // ======================================================

    const [
        result
    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .CREATE_TRANSACTION,

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

            JSON.stringify(
                metadata
            )

        ]

    );


    return result.insertId;

};


const getLedgerByIdempotencyKey = async (
    connection,
    idempotencyKey
) => {

    if (
        !idempotencyKey ||
        typeof idempotencyKey !== "string"
    ) {

        return null;

    }


    const normalizedKey =
        idempotencyKey.trim();


    if (
        !normalizedKey
    ) {

        return null;

    }


    const [
        rows
    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .GET_BY_IDEMPOTENCY_KEY,

        [

            normalizedKey

        ]

    );


    return rows.length
        ? rows[0]
        : null;

};

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
            .GET_WALLET_TRANSACTIONS,

        [

            walletId,

            Number(limit),

            Number(offset)

        ]

    );


    return rows;

};


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
            .GET_MERCHANT_TRANSACTIONS,

        [

            merchantId,

            Number(limit),

            Number(offset)

        ]

    );


    return rows;

};


const getLedgerByReference = async (
    connection,
    {
        merchantId,
        referenceType,
        referenceId
    }
) => {

    if (
        !merchantId ||
        !referenceType ||
        !referenceId
    ) {

        return null;

    }


    const [
        rows
    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .GET_BY_REFERENCE,

        [

            merchantId,

            referenceType,

            referenceId

        ]

    );


    return rows.length
        ? rows[0]
        : null;

};

const updateLedgerStatus = async (
    connection,
    {
        ledgerId,
        status,
        description,
        metadata
    }
) => {

    const [
        result
    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .UPDATE_LEDGER_STATUS,

        [

            status,

            description || null,

            metadata
                ? JSON.stringify(
                    metadata
                )
                : null,

            ledgerId

        ]

    );


    return (
        result.affectedRows === 1
    );

};

module.exports = {
    createLedgerEntry,
    getLedgerByIdempotencyKey,
    getLedgerByReference,
    updateLedgerStatus,
    getWalletLedger,
    getMerchantLedger
};