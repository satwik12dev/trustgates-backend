const WALLET_BALANCE_QUERIES = require(
    "../../../queries/merchant/wallet/walletBalance.query"
);


const {
    buildWalletBalanceResponse
} = require(
    "../../../utils/merchant/wallet/walletResponse.helper"
);


const db = require(
    "../../../config/pool"
);



// ==========================================================
// Wallet Balance Service
// ==========================================================

const walletBalanceService = async (

    merchantId

) => {


    const [wallet] = await db.query(

        WALLET_BALANCE_QUERIES.GET_WALLET_BALANCE,

        [

            merchantId

        ]

    );



    if(!wallet.length){


        return {

            success:false,

            message:
                "Wallet not found."

        };

    }



    return buildWalletBalanceResponse(

        wallet[0]

    );


};



module.exports = walletBalanceService;