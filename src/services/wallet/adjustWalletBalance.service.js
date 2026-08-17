const {

    lockWalletByMerchant

} = require(
    "./helpers/walletLock.helper"
);


const {

    createLedgerEntry,

    getLedgerByIdempotencyKey

} = require("./helpers/walletLedger.helper");


const {

    createWalletAuditLog

} = require(
    "./helpers/walletAudit.helper"
);


const {

    validateWalletActive,

    validateCreditAmount,

    validateDebitAmount,

    validateSufficientBalance

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
// Adjust Wallet Balance
// ==================================================

const adjustWalletBalanceService = async (

    connection,

    {

        merchantId,

        amount,

        type,

        referenceId,

        idempotencyKey,

        reason,

        performedBy

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



    let balanceBefore;

    let balanceAfter;

    let transactionType;



    // ==========================================
    // CREDIT Adjustment
    // ==========================================

    if (type === "CREDIT") {



        validateCreditAmount(

            amount

        );



        balanceBefore = Number(

            wallet.available_balance

        );



        balanceAfter =

            balanceBefore +

            Number(amount);



        transactionType =

            WALLET_TRANSACTION_TYPE.CREDIT;



    }



    // ==========================================
    // DEBIT Adjustment
    // ==========================================

    else if (type === "DEBIT") {



        validateDebitAmount(

            amount

        );



        validateSufficientBalance(

            wallet.available_balance,

            amount

        );



        balanceBefore = Number(

            wallet.available_balance

        );



        balanceAfter =

            balanceBefore -

            Number(amount);



        transactionType =

            WALLET_TRANSACTION_TYPE.DEBIT;



    }



    else {


        throw new Error(

            "Invalid adjustment type."

        );


    }



    // ==========================================
    // Update Wallet
    // ==========================================

    await updateWalletBalanceService(

        connection,

        {

            walletId:
                wallet.wallet_id,

            availableBalance:
                balanceAfter,

            pendingBalance:
                wallet.pending_balance,

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


            transactionType,


            source:

                WALLET_SOURCE.ADJUSTMENT,


            amount,


            balanceBefore,


            balanceAfter,


            referenceType:

                WALLET_REFERENCE_TYPE.ADJUSTMENT,


            referenceId,


            idempotencyKey,


            status:

                WALLET_LEDGER_STATUS.COMPLETED,


            description:

                "Manual wallet adjustment.",


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

                "WALLET_ADJUSTMENT",


            amount,


            performedBy,


            performerType:

                WALLET_PERFORMER_TYPE.ADMIN,


            remarks:

                reason || "Wallet balance adjusted.",


            metadata: {

                referenceId,

                ledgerId,

                type


            }


        }

    );



    return {


        success: true,


        walletId:

            wallet.wallet_id,


        ledgerId,


        adjustedAmount:

            Number(amount),


        type


    };


};



module.exports = adjustWalletBalanceService;