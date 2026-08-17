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
    validateCreditAmount
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
// Credit Wallet Service
// ==========================================================
//
// PAYMENT SUCCESS
//
// available_balance += amount
// total_received    += amount
//
// IMPORTANT:
//
// - pending_balance is NOT touched
// - reserved_balance is NOT touched
// - blocked_balance is NOT touched
// - no T+7 release job
//
// This service must be called inside an existing DB
// transaction.
//
// ==========================================================

const creditWalletService = async (
    connection,
    {
        merchantId,
        amount,
        referenceId,
        idempotencyKey,
        description = "Wallet credited after successful payment.",
        metadata = {}
    }
) => {

    // ======================================================
    // 1. Validate Amount
    // ======================================================

    validateCreditAmount(
        amount
    );


    const creditAmount =
        Number(amount);


    // ======================================================
    // 2. Validate Idempotency Key
    // ======================================================

    if (
        !idempotencyKey ||
        typeof idempotencyKey !== "string"
    ) {

        throw new Error(
            "Wallet credit idempotency key is required."
        );

    }


    // ======================================================
    // 3. Idempotency Check
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

            amount:
                creditAmount,

            status:
                "COMPLETED"

        };

    }


    // ======================================================
    // 4. Lock Wallet
    // ======================================================
    //
    // FOR UPDATE ensures concurrent payment credits for
    // the same merchant are serialized.
    //
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
    // 5. Validate Wallet
    // ======================================================

    validateWalletActive(
        wallet
    );


    // ======================================================
    // 6. Capture Existing Balance
    // ======================================================

    const availableBefore =
        Number(
            wallet.available_balance
        );


    const totalReceivedBefore =
        Number(
            wallet.total_received
        );


    const availableAfter =
        availableBefore +
        creditAmount;


    const totalReceivedAfter =
        totalReceivedBefore +
        creditAmount;


    // ======================================================
    // 7. Credit Wallet
    // ======================================================
    //
    // Payment SUCCESS:
    //
    // available_balance += amount
    // total_received    += amount
    //
    // The query itself performs the atomic update.
    //
    // ======================================================

    const [
        result
    ] = await connection.query(

        WALLET_QUERIES
            .CREDIT_WALLET,

        [

            creditAmount,

            creditAmount,

            merchantId

        ]

    );


    if (
        result.affectedRows !== 1
    ) {

        throw new Error(
            "Failed to credit merchant wallet."
        );

    }


    // ======================================================
    // 8. Create Wallet Ledger
    // ======================================================
    //
    // Payment credit is immediately COMPLETED because the
    // payment has already been confirmed successfully.
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
                    WALLET_TRANSACTION_TYPE.CREDIT,

                source:
                    WALLET_SOURCE.PAYMENT,

                amount:
                    creditAmount,

                balanceBefore:
                    availableBefore,

                balanceAfter:
                    availableAfter,

                referenceType:
                    WALLET_REFERENCE_TYPE.PAYMENT,

                referenceId,

                idempotencyKey,

                status:
                    WALLET_LEDGER_STATUS.COMPLETED,

                description,

                metadata: {

                    ...metadata,

                    totalReceivedBefore,

                    totalReceivedAfter

                }

            }

        );


    // ======================================================
    // 9. Wallet Audit
    // ======================================================

    await createWalletAuditLog(

        connection,

        {

            walletId:
                wallet.wallet_id,

            merchantId,

            action:
                "WALLET_CREDIT",

            amount:
                creditAmount,

            performedBy:
                null,

            performerType:
                WALLET_PERFORMER_TYPE.SYSTEM,

            remarks:
                "Wallet credited after successful payment.",

            metadata: {

                referenceId,

                ledgerId,

                idempotencyKey,

                availableBefore,

                availableAfter,

                totalReceivedBefore,

                totalReceivedAfter

            }

        }

    );


    // ======================================================
    // 10. Return
    // ======================================================

    return {

        success: true,

        duplicate: false,

        ledgerId,

        walletId:
            wallet.wallet_id,

        merchantId,

        amount:
            creditAmount,

        balance: {

            availableBefore,

            availableAfter,

            totalReceivedBefore,

            totalReceivedAfter

        },

        status:
            "COMPLETED"

    };

};


// ==========================================================
// Export
// ==========================================================

module.exports = creditWalletService;