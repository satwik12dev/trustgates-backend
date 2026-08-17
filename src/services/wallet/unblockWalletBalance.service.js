const {

    lockWalletByMerchant

} = require(
    "./helpers/walletLock.helper"
);


const {

    createLedgerEntry,

    getLedgerByIdempotencyKey

} = require(
    "./helpers/walletLedger.helper"
);


const {

    createWalletAuditLog

} = require(
    "./helpers/walletAudit.helper"
);


const {

    validateWalletActive,

    validateCreditAmount

} = require(
    "./helpers/walletValidation.helper"
);


const updateWalletBalanceService = require(
    "./updateWalletBalance.service"
);


const {

    WALLET_TRANSACTION_TYPE,

    WALLET_SOURCE,

    WALLET_LEDGER_STATUS,

    WALLET_REFERENCE_TYPE,

    WALLET_PERFORMER_TYPE

} = require(
    "../../constants/wallet.constants"
);



// ==================================================
// Unblock Wallet Balance
// ==================================================

const unblockWalletBalanceService = async (

    connection,

    {

        merchantId,

        amount,

        referenceId,

        idempotencyKey,

        reason

    }

) => {



    // ==========================================
    // Idempotency Check
    // ==========================================

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

                existingLedger.wallet_transaction_id


        };


    }



    // ==========================================
    // Lock Wallet
    // ==========================================

    const wallet = await lockWalletByMerchant(

        connection,

        merchantId

    );



    validateWalletActive(

        wallet

    );



    validateCreditAmount(

        amount

    );



    // ==========================================
    // Check Blocked Balance
    // ==========================================

    if (

        Number(amount) >

        Number(wallet.blocked_balance)

    ) {

        throw new Error(

            "Unblock amount exceeds blocked balance."

        );

    }



    // ==========================================
    // Calculate Balance
    // ==========================================

    const availableBefore = Number(

        wallet.available_balance

    );


    const availableAfter =

        availableBefore +

        Number(amount);



    const blockedAfter =

        Number(wallet.blocked_balance)

        -

        Number(amount);



    // ==========================================
    // Update Wallet
    // ==========================================

    await updateWalletBalanceService(

        connection,

        {

            walletId:
                wallet.wallet_id,

            availableBalance:
                availableAfter,

            pendingBalance:
                wallet.pending_balance,

            reservedBalance:
                wallet.reserved_balance,

            blockedBalance:
                blockedAfter,

            totalReceived:
                wallet.total_received,

            totalRefunded:
                wallet.total_refunded,

            totalSettled:
                wallet.total_settled,

            version:
                wallet.version

        }

    );



    // ==========================================
    // Create Ledger Entry
    // ==========================================

    const ledgerId = await createLedgerEntry(

        connection,

        {

            walletId:

                wallet.wallet_id,


            merchantId,


            transactionType:

                WALLET_TRANSACTION_TYPE.CREDIT,


            source:

                WALLET_SOURCE.ADJUSTMENT,


            amount,


            balanceBefore:

                availableBefore,


            balanceAfter:

                availableAfter,


            referenceType:

                WALLET_REFERENCE_TYPE.ADJUSTMENT,


            referenceId,


            idempotencyKey,


            status:

                WALLET_LEDGER_STATUS.COMPLETED,


            description:

                "Blocked wallet balance released.",


            metadata: {

                reason

            }


        }

    );



    // ==========================================
    // Audit Log
    // ==========================================

    await createWalletAuditLog(

        connection,

        {

            walletId:

                wallet.wallet_id,


            merchantId,


            action:

                "WALLET_BALANCE_UNBLOCKED",


            amount,


            performerType:

                WALLET_PERFORMER_TYPE.ADMIN,


            remarks:

                reason || "Wallet balance unblocked.",


            metadata: {

                referenceId,

                ledgerId

            }


        }

    );



    return {


        success: true,


        walletId:

            wallet.wallet_id,


        releasedAmount:

            Number(amount),


        ledgerId


    };


};



module.exports = unblockWalletBalanceService;