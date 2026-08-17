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


// ==========================================================
// Debit Wallet / Reserve Refund Amount
// ==========================================================
//
// REFUND APPROVAL FLOW:
//
// refund amount + fee
//         ↓
//   total debit amount
//         ↓
// available_balance -= totalDebitAmount
// reserved_balance  += totalDebitAmount
//
// Example:
//
// Refund       = ₹1000
// Fee          = ₹20
// Total Debit  = ₹1020
//
// available = ₹10000
// reserved  = ₹0
//
// After reservation:
//
// available = ₹8980
// reserved  = ₹1020
//
// IMPORTANT:
//
// total_refunded is NOT updated here.
//
// It will only increase after the refund is confirmed
// SUCCESS by the refund provider.
//
// If refund fails:
//
// reserved → available
//
// ==========================================================


const debitWalletService = async (
    connection,
    {
        merchantId,

        // Actual refund amount
        amount,

        // Refund fee
        feeAmount = 0,

        // Optional explicit total.
        // If not supplied:
        // amount + feeAmount
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


    // ======================================================
    // 1. Validate Refund Amount
    // ======================================================

    validateDebitAmount(
        amount
    );


    const refundAmount =
        Number(amount);


    // ======================================================
    // 2. Validate Fee
    // ======================================================

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


    // ======================================================
    // 3. Calculate Total Debit
    // ======================================================

    const expectedTotalDebit =
        refundAmount +
        calculatedFee;


    const totalAmount =
        totalDebitAmount !== undefined &&
        totalDebitAmount !== null

            ? Number(totalDebitAmount)

            : expectedTotalDebit;


    // ======================================================
    // 4. Validate Total Debit
    // ======================================================

    if (
        !Number.isFinite(totalAmount) ||
        totalAmount <= 0
    ) {

        throw new Error(
            "Invalid total wallet debit amount."
        );

    }


    // ======================================================
    // 5. Prevent Amount Manipulation
    // ======================================================
    //
    // totalDebitAmount MUST equal:
    //
    // refund amount + fee
    //
    // ======================================================

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


    // ======================================================
    // 6. Validate Idempotency Key
    // ======================================================

    if (
        !idempotencyKey ||
        typeof idempotencyKey !== "string" ||
        !idempotencyKey.trim()
    ) {

        throw new Error(
            "Wallet debit idempotency key is required."
        );

    }


    // ======================================================
    // 7. Validate Source
    // ======================================================

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


    // ======================================================
    // 8. Idempotency Check
    // ======================================================

    const existingLedger =
        await getLedgerByIdempotencyKey(
            connection,
            idempotencyKey
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

            merchantId,

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


    // ======================================================
    // 9. Lock Merchant Wallet
    // ======================================================
    //
    // SELECT ... FOR UPDATE
    //
    // This prevents two simultaneous refund approvals
    // from spending the same available balance.
    //
    // ======================================================

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


    // ======================================================
    // 10. Validate Wallet
    // ======================================================

    validateWalletActive(
        wallet
    );


    // ======================================================
    // 11. Check Available Balance
    // ======================================================
    //
    // IMPORTANT:
    //
    // We check TOTAL debit requirement.
    //
    // Refund ₹1000
    // Fee ₹20
    //
    // Required = ₹1020
    //
    // ======================================================

    validateSufficientBalance(
        wallet.available_balance,
        totalAmount
    );


    // ======================================================
    // 12. Current Balances
    // ======================================================

    const availableBefore =
        Number(
            wallet.available_balance
        );


    const reservedBefore =
        Number(
            wallet.reserved_balance
        );


    // ======================================================
    // 13. New Balances
    // ======================================================

    const availableAfter =
        availableBefore -
        totalAmount;


    const reservedAfter =
        reservedBefore +
        totalAmount;


    // ======================================================
    // 14. Reserve Total Amount
    // ======================================================
    //
    // available_balance -= totalAmount
    // reserved_balance  += totalAmount
    //
    // Example:
    //
    // available = 10000
    // reserved  = 0
    //
    // total debit = 1020
    //
    // available = 8980
    // reserved  = 1020
    //
    // ======================================================

    const [
        result
    ] = await connection.query(

        WALLET_QUERIES
            .RESERVE_WALLET_BALANCE,

        [

            totalAmount,

            totalAmount,

            merchantId,

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


    // ======================================================
    // 15. Create Pending Ledger
    // ======================================================
    //
    // amount       = actual refund amount
    // fee_amount   = refund fee
    // total_amount = actual wallet reservation
    //
    // ======================================================

    const ledgerId =
        await createLedgerEntry(
            connection,
            {

                walletId:
                    wallet.wallet_id,

                merchantId,

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

                idempotencyKey,

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


    // ======================================================
    // 16. Create Wallet Audit
    // ======================================================

    await createWalletAuditLog(
        connection,
        {

            walletId:
                wallet.wallet_id,

            merchantId,

            action:
                "WALLET_DEBIT_RESERVED",

            // Audit amount represents actual wallet movement
            amount:
                totalAmount,

            performedBy,

            performerType,

            remarks:
                `Refund amount ₹${refundAmount.toFixed(2)} + fee ₹${calculatedFee.toFixed(2)} reserved from wallet.`,

            metadata: {

                referenceId,

                ledgerId,

                idempotencyKey,

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


    // ======================================================
    // 17. Return
    // ======================================================

    return {

        success: true,

        duplicate: false,

        ledgerId,

        walletId:
            wallet.wallet_id,

        merchantId,

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


// ==========================================================
// Export
// ==========================================================

module.exports =
    debitWalletService;