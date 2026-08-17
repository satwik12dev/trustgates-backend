const buildWalletResponse = (

    wallet

) => {


    return {

        walletId: wallet.wallet_id,

        merchantId: wallet.merchant_id,

        availableBalance:
            Number(wallet.available_balance),

        pendingBalance:
            Number(wallet.pending_balance),

        blockedBalance:
            Number(wallet.blocked_balance),

        currency:
            wallet.currency,

        status:
            wallet.wallet_status,

        createdAt:
            wallet.created_at,

        updatedAt:
            wallet.updated_at

    };

};



const buildLedgerResponse = (

    transaction

) => {


    return {

        transactionId:
            transaction.wallet_transaction_id,

        type:
            transaction.transaction_type,

        source:
            transaction.source,

        amount:
            Number(transaction.amount),

        balanceBefore:
            Number(transaction.balance_before),

        balanceAfter:
            Number(transaction.balance_after),

        referenceType:
            transaction.reference_type,

        referenceId:
            transaction.reference_id,

        status:
            transaction.status,

        description:
            transaction.description,

        createdAt:
            transaction.created_at

    };

};



module.exports = {

    buildWalletResponse,

    buildLedgerResponse

};