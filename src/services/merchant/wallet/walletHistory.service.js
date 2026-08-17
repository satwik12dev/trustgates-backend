const WALLET_HISTORY_QUERIES = require(
    "../../../queries/merchant/wallet/walletHistory.query"
);


const {

    buildWalletHistoryResponse

} = require(
    "../../../utils/merchant/wallet/walletResponse.helper"
);


const db = require(
    "../../../config/pool"
);



// ==========================================================
// Wallet History Service
// ==========================================================

const walletHistoryService = async (

    merchantId,

    filters

) => {


    const page =

        Number(filters.page || 1);



    const limit =

        Number(filters.limit || 20);



    const offset =

        (page - 1) * limit;



    const [

        transactions

    ] = await db.query(


        WALLET_HISTORY_QUERIES.GET_WALLET_HISTORY,


        [

            merchantId,

            limit,

            offset

        ]

    );




    const [

        count

    ] = await db.query(


        WALLET_HISTORY_QUERIES.COUNT_WALLET_HISTORY,


        [

            merchantId

        ]

    );




    return buildWalletHistoryResponse(


        transactions,


        {


            page,


            limit,


            total:

                Number(

                    count[0].total

                )


        }


    );


};



module.exports = walletHistoryService;