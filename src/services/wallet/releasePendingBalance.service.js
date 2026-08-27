const {
    lockWalletByMerchant
} = require(
    "./helpers/walletLock.helper"
);

const {
    getLedgerByIdempotencyKey
} = require(
    "./helpers/walletLedger.helper"
);

const {
    createWalletAuditLog
} = require(
    "./helpers/walletAudit.helper"
);

const WALLET_QUERIES =
    require(
        "../../queries/wallet/wallet.query"
    );

const WALLET_LEDGER_QUERIES =
    require(
        "../../queries/wallet/walletLedger.query"
    );

const {
    WALLET_LEDGER_STATUS,
    WALLET_PERFORMER_TYPE
} = require(
    "../../constants/wallet.constants"
);


// ==========================================================
// Release Refund Wallet Service
// ==========================================================
//
// Called when Razorpay refund FAILED.
//
// Refund request had already:
//
// available_balance -= totalDebit
// reserved_balance  += totalDebit
//
// On failure:
//
// reserved_balance  -= totalDebit
// available_balance  += totalDebit
//
// total_refunded is NOT changed.
//
// Ledger:
//
// PENDING → REVERSED
//
// pending_balance is NOT touched.
//
// ==========================================================

const releaseRefundWalletService = async (

    connection,

    {
        merchantId,
        amount,
        feeAmount = 0,
        totalDebitAmount,
        referenceId,
        idempotencyKey,
        razorpayRefundId = null,
        failureReason = null,
        metadata = {}
    }

) => {


    // ======================================================
    // 1. Validate Amounts
    // ======================================================

    const refundAmount =
        Number(amount);


    const refundFee =
        Number(feeAmount);


    const totalDebit =
        totalDebitAmount !== undefined &&
        totalDebitAmount !== null

            ? Number(totalDebitAmount)

            : refundAmount + refundFee;


    if (
        !Number.isFinite(refundAmount) ||
        refundAmount <= 0
    ) {

        throw new Error(
            "Invalid refund amount."
        );

    }


    if (
        !Number.isFinite(refundFee) ||
        refundFee < 0
    ) {

        throw new Error(
            "Invalid refund fee."
        );

    }


    if (
        !Number.isFinite(totalDebit) ||
        totalDebit <= 0
    ) {

        throw new Error(
            "Invalid total refund debit amount."
        );

    }


    const expectedTotal =
        refundAmount +
        refundFee;


    if (
        Math.abs(
            totalDebit -
            expectedTotal
        ) > 0.0001
    ) {

        throw new Error(
            "Total refund debit must equal refund amount + fee."
        );

    }


    if (!merchantId) {

        throw new Error(
            "Merchant ID is required."
        );

    }


    if (!referenceId) {

        throw new Error(
            "Refund reference ID is required."
        );

    }


    if (
        !idempotencyKey ||
        typeof idempotencyKey !== "string"
    ) {

        throw new Error(
            "Refund release idempotency key is required."
        );

    }


    // ======================================================
    // 2. Idempotency Check
    // ======================================================

    const existingLedger =
        await getLedgerByIdempotencyKey(

            connection,

            idempotencyKey

        );


    if (existingLedger) {

        return {

            success: true,

            duplicate: true,

            ledgerId:
                existingLedger.wallet_transaction_id,

            walletId:
                existingLedger.wallet_id,

            merchantId,

            refundAmount,

            feeAmount:
                refundFee,

            totalDebitAmount:
                totalDebit,

            status:
                existingLedger.status

        };

    }


    // ======================================================
    // 3. Lock Merchant Wallet
    // ======================================================

    const wallet =
        await lockWalletByMerchant(

            connection,

            merchantId

        );


    if (!wallet) {

        throw new Error(
            "Merchant wallet not found."
        );

    }


    // ======================================================
    // 4. Validate Wallet
    // ======================================================

    if (
        wallet.wallet_status !== "ACTIVE"
    ) {

        throw new Error(
            "Merchant wallet is not active."
        );

    }


    // ======================================================
    // 5. Find Pending Refund Ledger
    // ======================================================

    const [
        ledgerRows
    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .GET_BY_REFERENCE,

        [
            "REFUND",
            referenceId
        ]

    );


    if (
        !ledgerRows.length
    ) {

        throw new Error(
            "Refund wallet ledger not found."
        );

    }


    const refundLedger =
        ledgerRows.find(

            ledger =>
                Number(
                    ledger.merchant_id
                ) === Number(
                    merchantId
                ) &&
                ledger.status ===
                    WALLET_LEDGER_STATUS.PENDING

        );


    // ======================================================
    // 6. Already Reversed / Already Processed
    // ======================================================

    if (!refundLedger) {

        const merchantLedger =
            ledgerRows.find(

                ledger =>
                    Number(
                        ledger.merchant_id
                    ) === Number(
                        merchantId
                    )

            );


        if (
            merchantLedger &&
            merchantLedger.status ===
                WALLET_LEDGER_STATUS.REVERSED
        ) {

            return {

                success: true,

                duplicate: true,

                ledgerId:
                    merchantLedger.wallet_transaction_id,

                walletId:
                    merchantLedger.wallet_id,

                merchantId,

                refundAmount,

                feeAmount:
                    refundFee,

                totalDebitAmount:
                    totalDebit,

                status:
                    "REVERSED"

            };

        }


        if (
            merchantLedger &&
            merchantLedger.status ===
                WALLET_LEDGER_STATUS.COMPLETED
        ) {

            throw new Error(
                "Refund has already been completed and cannot be reversed."
            );

        }


        throw new Error(
            "Pending refund wallet ledger not found."
        );

    }


    // ======================================================
    // 7. Validate Ledger Amounts
    // ======================================================

    const ledgerAmount =
        Number(
            refundLedger.amount
        );


    const ledgerFee =
        Number(
            refundLedger.fee_amount
        );


    const ledgerTotal =
        Number(
            refundLedger.total_amount
        );


    if (
        Math.abs(
            ledgerAmount -
            refundAmount
        ) > 0.0001
    ) {

        throw new Error(
            "Refund amount does not match wallet ledger."
        );

    }


    if (
        Math.abs(
            ledgerFee -
            refundFee
        ) > 0.0001
    ) {

        throw new Error(
            "Refund fee does not match wallet ledger."
        );

    }


    if (
        Math.abs(
            ledgerTotal -
            totalDebit
        ) > 0.0001
    ) {

        throw new Error(
            "Refund total debit does not match wallet ledger."
        );

    }


    // ======================================================
    // 8. Validate Reserved Balance
    // ======================================================

    if (
        Number(wallet.reserved_balance) <
        totalDebit
    ) {

        throw new Error(
            "Insufficient reserved balance for refund release."
        );

    }


    // ======================================================
    // 9. Capture Balances
    // ======================================================

    const availableBefore =
        Number(
            wallet.available_balance
        );


    const reservedBefore =
        Number(
            wallet.reserved_balance
        );


    const availableAfter =
        availableBefore +
        totalDebit;


    const reservedAfter =
        reservedBefore -
        totalDebit;


    const totalRefundedBefore =
        Number(
            wallet.total_refunded
        );


    // IMPORTANT:
    //
    // total_refunded does NOT change
    // because Razorpay refund failed.
    //


    // ======================================================
    // 10. Release Reserved Balance
    // ======================================================

    const [
        walletUpdateResult
    ] = await connection.query(

        WALLET_QUERIES
            .RELEASE_RESERVED_BALANCE,

        [

            totalDebit,

            totalDebit,

            merchantId,

            totalDebit

        ]

    );


    if (
        walletUpdateResult
            .affectedRows !== 1
    ) {

        throw new Error(
            "Failed to release reserved refund balance."
        );

    }


    // ======================================================
    // 11. Mark Ledger REVERSED
    // ======================================================

    const [
        ledgerUpdateResult
    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .MARK_REVERSED,

        [
            refundLedger.wallet_transaction_id
        ]

    );


    if (
        ledgerUpdateResult
            .affectedRows !== 1
    ) {

        throw new Error(
            "Failed to reverse refund wallet ledger."
        );

    }


    // ======================================================
    // 12. Wallet Audit Log
    // ======================================================

    await createWalletAuditLog(

        connection,

        {

            walletId:
                wallet.wallet_id,

            merchantId,

            action:
                "REFUND_WALLET_RELEASED",

            amount:
                refundAmount,

            performerType:
                WALLET_PERFORMER_TYPE.SYSTEM,

            remarks:
                failureReason ||
                "Refund failed. Reserved wallet balance released.",

            metadata: {

                referenceId,

                idempotencyKey,

                razorpayRefundId,

                refundAmount,

                feeAmount:
                    refundFee,

                totalDebitAmount:
                    totalDebit,

                availableBefore,

                availableAfter,

                reservedBefore,

                reservedAfter,

                totalRefundedBefore,

                ledgerId:
                    refundLedger
                        .wallet_transaction_id,

                ...metadata

            }

        }

    );


    // ======================================================
    // 13. Return
    // ======================================================

    return {

        success: true,

        duplicate: false,

        walletId:
            wallet.wallet_id,

        merchantId,

        ledgerId:
            refundLedger
                .wallet_transaction_id,

        refundAmount,

        feeAmount:
            refundFee,

        totalDebitAmount:
            totalDebit,

        balance: {

            availableBefore,

            availableAfter,

            reservedBefore,

            reservedAfter

        },

        totalRefunded:
            totalRefundedBefore,

        status:
            "REVERSED"

    };

};


module.exports =
    releaseRefundWalletService;