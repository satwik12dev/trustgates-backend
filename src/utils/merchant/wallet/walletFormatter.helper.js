const formatWalletBalance = (wallet) => {

    if(!wallet){
        return null;
    }


    return {

        walletId:
            wallet.wallet_id,


        merchantId:
            wallet.merchant_id,


        availableBalance:
            Number(wallet.available_balance),


        pendingBalance:
            Number(wallet.pending_balance),


        blockedBalance:
            Number(wallet.blocked_balance),


        totalReceived:
            Number(wallet.total_received),


        totalRefunded:
            Number(wallet.total_refunded),


        totalSettled:
            Number(wallet.total_settled),


        currency:
            wallet.currency,


        status:
            wallet.wallet_status,


        lastTransactionAt:
            wallet.last_transaction_at

    };

};




// ==========================================================
// Format Wallet Ledger
// ==========================================================

const formatWalletTransaction = (transaction) => {


    return {


        walletTransactionId:
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


        metadata:
            transaction.metadata,


        createdAt:
            transaction.created_at


    };

};




// ==========================================================
// Format Analytics
// ==========================================================

const formatWalletAnalytics = (data)=>{


    return {

        totalCredit:
            Number(data.total_credit || 0),


        totalDebit:
            Number(data.total_debit || 0),


        totalTransactions:
            Number(data.total_transactions || 0)

    };


};



module.exports = {

    formatWalletBalance,

    formatWalletTransaction,

    formatWalletAnalytics

};