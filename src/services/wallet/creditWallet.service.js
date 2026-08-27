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
    validateCreditAmount,
    validateIdempotencyKey
} = require("./helpers/walletValidation.helper");

const WALLET_QUERIES = require("../../queries/wallet/wallet.query");

const {
    WALLET_TRANSACTION_TYPE,
    WALLET_SOURCE,
    WALLET_LEDGER_STATUS,
    WALLET_REFERENCE_TYPE,
    WALLET_PERFORMER_TYPE
} = require("../../constants/wallet.constants");


const creditWalletService = async (
    connection,
    {
        merchantId,
        amount,
        referenceId,
        idempotencyKey,
        description =
            "Wallet credited after successful payment.",
        metadata = {}
    }
) => {

    validateCreditAmount(
        amount
    );

    validateIdempotencyKey(
        idempotencyKey
    );


    const creditAmount =
        Number(amount);


    if (
        typeof referenceId !== "string" ||
        referenceId.trim().length === 0
    ) {

        throw new Error(
            "Wallet credit reference id is required."
        );

    }


    if (
        metadata === null ||
        typeof metadata !== "object" ||
        Array.isArray(metadata)
    ) {

        throw new Error(
            "Wallet credit metadata must be an object."
        );

    }


    const normalizedReferenceId =
        referenceId.trim();


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

            merchantId:
                existingLedger.merchant_id,

            amount:
                Number(
                    existingLedger.amount
                ),

            balance: {

                availableBefore:
                    Number(
                        existingLedger.balance_before
                    ),

                availableAfter:
                    Number(
                        existingLedger.balance_after
                    )

            },

            status:
                existingLedger.status

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


    const [
        result
    ] = await connection.query(

        WALLET_QUERIES
            .CREDIT_WALLET,

        [

            creditAmount,

            creditAmount,

            wallet.wallet_id

        ]

    );


    if (
        result.affectedRows !== 1
    ) {

        throw new Error(
            "Failed to credit merchant wallet."
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
                    WALLET_TRANSACTION_TYPE.CREDIT,

                source:
                    WALLET_SOURCE.PAYMENT,

                amount:
                    creditAmount,

                feeAmount:
                    0,

                totalAmount:
                    creditAmount,

                balanceBefore:
                    availableBefore,

                balanceAfter:
                    availableAfter,

                referenceType:
                    WALLET_REFERENCE_TYPE.PAYMENT,

                referenceId:
                    normalizedReferenceId,

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


    await createWalletAuditLog(

        connection,

        {

            walletId:
                wallet.wallet_id,

            merchantId:
                wallet.merchant_id,

            action:
                "WALLET_CREDIT",

            amount:
                creditAmount,

            performedBy:
                null,

            performerType:
                WALLET_PERFORMER_TYPE.SYSTEM,

            remarks:
                description,

            metadata: {

                referenceId:
                    normalizedReferenceId,

                ledgerId,

                idempotencyKey,

                availableBefore,

                availableAfter,

                totalReceivedBefore,

                totalReceivedAfter

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
            creditAmount,

        balance: {

            availableBefore,

            availableAfter,

            totalReceivedBefore,

            totalReceivedAfter

        },

        status:
            WALLET_LEDGER_STATUS.COMPLETED

    };

};

module.exports = creditWalletService;