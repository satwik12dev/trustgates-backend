// ==========================================================
// Wallet Overview Response Helper
// ==========================================================


const buildWalletDashboardResponse = (

    wallet,

    transactionSummary

) => {


    return {


        success:true,


        data:{


            walletId:

                wallet.wallet_id,


            merchantId:

                wallet.merchant_id,


            availableBalance:

                Number(
                    wallet.available_balance || 0
                ),


            pendingBalance:

                Number(
                    wallet.pending_balance || 0
                ),


            blockedBalance:

                Number(
                    wallet.blocked_balance || 0
                ),


            totalReceived:

                Number(
                    wallet.total_received || 0
                ),


            totalRefunded:

                Number(
                    wallet.total_refunded || 0
                ),


            totalSettled:

                Number(
                    wallet.total_settled || 0
                ),


            currency:

                wallet.currency,


            status:

                wallet.wallet_status,


            totalWalletTransactions:

                Number(
                    transactionSummary?.total_transactions || 0
                )



        }


    };


};



module.exports = {

    buildWalletDashboardResponse

};