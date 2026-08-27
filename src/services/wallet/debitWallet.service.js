const {
    lockWalletByMerchant
} = require("./helpers/walletLock.helper");

const {
    createLedgerEntry,
    getLedgerByIdempotencyKey
} = require("./helpers/walletLedger.helper");

const {
    createWalletAuditLog
} = require("./helpers/walletAudit.helper");

const {
    validateWalletActive,
    validateDebitAmount,
    validateSufficientBalance
} = require("./helpers/walletValidation.helper");

const WALLET_QUERIES =
    require("../../queries/wallet/wallet.query");

const {
    WALLET_TRANSACTION_TYPE,
    WALLET_SOURCE,
    WALLET_LEDGER_STATUS,
    WALLET_REFERENCE_TYPE,
    WALLET_PERFORMER_TYPE
} = require("../../constants/wallet.constants");


const debitWalletService = async (
    connection,
    {
        merchantId,
        amount,
        feeAmount = 0,
        totalDebitAmount,
        referenceId,
        idempotencyKey,
        source = "REFUND",
        description =
            "Refund amount and fee reserved from wallet.",
        metadata = {},
        performedBy = null,
        performerType =
            WALLET_PERFORMER_TYPE.SYSTEM
    }
) => {

    validateDebitAmount(
        amount
    );

    const refundAmount =
        Number(amount);

    const calculatedFee =
        Number(feeAmount);

    if (
        !Number.isFinite(calculatedFee) ||
        calculatedFee < 0
    ) {
        throw new Error(
            "Invalid wallet debit fee amount."
        );
    }

    const expectedTotalDebit =
        refundAmount +
        calculatedFee;

    const totalAmount =
        totalDebitAmount !== undefined &&
        totalDebitAmount !== null
            ? Number(totalDebitAmount)
            : expectedTotalDebit;

    if (
        !Number.isFinite(totalAmount) ||
        totalAmount <= 0
    ) {
        throw new Error(
            "Invalid total wallet debit amount."
        );
    }

    if (
        Math.abs(
            totalAmount -
            expectedTotalDebit
        ) > 0.0001
    ) {
        throw new Error(
            "Total debit amount must equal refund amount + fee amount."
        );
    }

    if (
        !idempotencyKey ||
        typeof idempotencyKey !== "string" ||
        !idempotencyKey.trim()
    ) {
        throw new Error(
            "Wallet debit idempotency key is required."
        );
    }

    const normalizedIdempotencyKey =
        idempotencyKey.trim();

    if (
        !WALLET_SOURCE[source]
    ) {
        throw new Error(
            "Invalid wallet debit source."
        );
    }

    if (
        !WALLET_REFERENCE_TYPE[source]
    ) {
        throw new Error(
            "Invalid wallet debit reference type."
        );
    }

    const existingLedger =
        await getLedgerByIdempotencyKey(
            connection,
            normalizedIdempotencyKey
        );

    if (
        existingLedger
    ) {
        return {
            success: true,
            duplicate: true,
            ledgerId:
                existingLedger.wallet_transaction_id,
            walletId:
                existingLedger.wallet_id,
            merchantId:
                existingLedger.merchant_id,
            amount:
                Number(
                    existingLedger.amount
                ),
            feeAmount:
                Number(
                    existingLedger.fee_amount
                ),
            totalDebitAmount:
                Number(
                    existingLedger.total_amount
                ),
            status:
                existingLedger.status ===
                WALLET_LEDGER_STATUS.PENDING
                    ? "RESERVED"
                    : existingLedger.status
        };
    }

    const wallet =
        await lockWalletByMerchant(
            connection,
            merchantId
        );

    if (
        !wallet
    ) {
        throw new Error(
            "Merchant wallet not found."
        );
    }

    validateWalletActive(
        wallet
    );

    validateSufficientBalance(
        wallet.available_balance,
        totalAmount
    );

    const availableBefore =
        Number(
            wallet.available_balance
        );

    const reservedBefore =
        Number(
            wallet.reserved_balance
        );

    const availableAfter =
        availableBefore -
        totalAmount;

    const reservedAfter =
        reservedBefore +
        totalAmount;

    const [
        result
    ] = await connection.query(
        WALLET_QUERIES
            .RESERVE_WALLET_BALANCE,
        [
            totalAmount,
            totalAmount,
            wallet.wallet_id,
            totalAmount
        ]
    );

    if (
        result.affectedRows !== 1
    ) {
        throw new Error(
            "Unable to reserve wallet balance."
        );
    }

    const ledgerId =
        await createLedgerEntry(
            connection,
            {
                walletId:
                    wallet.wallet_id,

                merchantId:
                    wallet.merchant_id,

                transactionType:
                    WALLET_TRANSACTION_TYPE.DEBIT,

                source:
                    WALLET_SOURCE[source],

                amount:
                    refundAmount,

                feeAmount:
                    calculatedFee,

                totalAmount:
                    totalAmount,

                balanceBefore:
                    availableBefore,

                balanceAfter:
                    availableAfter,

                referenceType:
                    WALLET_REFERENCE_TYPE[source],

                referenceId,

                idempotencyKey:
                    normalizedIdempotencyKey,

                status:
                    WALLET_LEDGER_STATUS.PENDING,

                description,

                metadata: {
                    ...metadata,

                    refundAmount,

                    feeAmount:
                        calculatedFee,

                    totalDebitAmount:
                        totalAmount,

                    availableBefore,

                    availableAfter,

                    reservedBefore,

                    reservedAfter,

                    reservationStatus:
                        "PENDING"
                }
            }
        );

    await createWalletAuditLog(
        connection,
        {
            walletId:
                wallet.wallet_id,

            merchantId:
                wallet.merchant_id,

            action:
                "WALLET_DEBIT_RESERVED",

            amount:
                totalAmount,

            performedBy,

            performerType,

            remarks:
                `Refund amount ₹${refundAmount.toFixed(2)} + fee ₹${calculatedFee.toFixed(2)} reserved from wallet.`,

            metadata: {
                referenceId,

                ledgerId,

                idempotencyKey:
                    normalizedIdempotencyKey,

                source,

                refundAmount,

                feeAmount:
                    calculatedFee,

                totalDebitAmount:
                    totalAmount,

                availableBefore,

                availableAfter,

                reservedBefore,

                reservedAfter,

                reservationStatus:
                    "PENDING"
            }
        }
    );

    return {
        success: true,

        duplicate: false,

        ledgerId,

        walletId:
            wallet.wallet_id,

        merchantId:
            wallet.merchant_id,

        amount:
            refundAmount,

        feeAmount:
            calculatedFee,

        totalDebitAmount:
            totalAmount,

        status:
            "RESERVED",

        balance: {
            availableBefore,

            availableAfter,

            reservedBefore,

            reservedAfter
        }
    };
};


module.exports =
    debitWalletService;