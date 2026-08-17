const WALLET_ANALYTICS_QUERIES = require(
    "../../../queries/merchant/wallet/walletAnalytics.query"
);



const {

    buildWalletAnalyticsResponse

} = require(
    "../../../utils/merchant/wallet/walletResponse.helper"
);


const db = require(
    "../../../config/pool"
);




// ==========================================================
// Wallet Analytics Service
// ==========================================================

const walletAnalyticsService = async (

    merchantId

)=>{


    const [

        summary

    ] = await db.query(


        WALLET_ANALYTICS_QUERIES.GET_WALLET_SUMMARY,


        [

            merchantId

        ]

    );



    const [

        sourceAnalytics

    ] = await db.query(


        WALLET_ANALYTICS_QUERIES.GET_SOURCE_ANALYTICS,


        [

            merchantId

        ]

    );




    const [

        trend

    ] = await db.query(


        WALLET_ANALYTICS_QUERIES.GET_MONTHLY_TREND,


        [

            merchantId

        ]

    );




    return buildWalletAnalyticsResponse(


        summary[0],


        sourceAnalytics,


        trend


    );



};



module.exports = walletAnalyticsService;