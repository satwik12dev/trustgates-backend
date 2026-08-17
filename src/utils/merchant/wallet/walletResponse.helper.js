const {

    formatWalletBalance,

    formatWalletTransaction,

    formatWalletAnalytics

} = require(
    "./walletFormatter.helper"
);



// ==========================================================
// Wallet Balance Response
// ==========================================================

const buildWalletBalanceResponse = (

    wallet

)=>{


    return {

        success:true,

        data:

            formatWalletBalance(wallet)

    };


};




// ==========================================================
// Wallet History Response
// ==========================================================

const buildWalletHistoryResponse = (

    transactions,

    pagination

)=>{


    return {


        success:true,


        data:{


            transactions:

                transactions.map(

                    formatWalletTransaction

                ),


            pagination


        }


    };


};




// ==========================================================
// Wallet Analytics Response
// ==========================================================

const buildWalletAnalyticsResponse = (

    analytics,

    sourceAnalytics,

    trend

)=>{


    return {


        success:true,


        data:{


            summary:

                formatWalletAnalytics(

                    analytics

                ),



            sourceAnalytics,


            trend


        }


    };


};



module.exports = {


    buildWalletBalanceResponse,


    buildWalletHistoryResponse,


    buildWalletAnalyticsResponse


};