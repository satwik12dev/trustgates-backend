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

    validatePendingBalance

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
// Release Pending Balance
// ==================================================

const releasePendingBalanceService = async (

    connection,

    {

        merchantId,

        amount,

        referenceId,

        idempotencyKey

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



    validatePendingBalance(

        wallet.pending_balance

    );



    if (

        Number(amount) >

        Number(wallet.pending_balance)

    ) {

        throw new Error(

            "Release amount exceeds pending balance."

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



    const pendingAfter =

        Number(wallet.pending_balance)

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
                pendingAfter,

            reservedBalance:
                wallet.reserved_balance,

            blockedBalance:
                wallet.blocked_balance,

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
    // Ledger Entry
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

                "SETTLEMENT",


            amount,


            balanceBefore:

                availableBefore,


            balanceAfter:

                availableAfter,


            referenceType:

                WALLET_REFERENCE_TYPE.SETTLEMENT,


            referenceId,


            idempotencyKey,


            status:

                WALLET_LEDGER_STATUS.COMPLETED,


            description:

                "Pending balance released.",


            metadata: {}

        }

    );



    // ==========================================
    // Audit
    // ==========================================

    await createWalletAuditLog(

        connection,

        {


            walletId:

                wallet.wallet_id,


            merchantId,


            action:

                "PENDING_BALANCE_RELEASED",


            amount,


            performerType:

                WALLET_PERFORMER_TYPE.SYSTEM,


            remarks:

                "Pending balance moved to available balance.",


            metadata: {

                referenceId,

                ledgerId

            }


        }

    );



    return {


        success: true,


        ledgerId,


        releasedAmount:

            Number(amount)


    };


};



module.exports = releasePendingBalanceService;