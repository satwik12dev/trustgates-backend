const db = require(
    "../../../config/pool"
);


const DASHBOARD_SUMMARY_QUERIES = require(
    "../../../queries/merchant/dashboard/summary.query"
);


const {

    buildDashboardSummaryResponse

} = require(
    "../../../utils/merchant/dashboard/summaryResponse.helper"
);



// ==========================================================
// Merchant Dashboard Summary Service
// ==========================================================

const summaryService = async (

    merchantId

) => {


    const [transactionResult] = await db.query(
    DASHBOARD_SUMMARY_QUERIES.GET_TRANSACTION_SUMMARY,
    [
        merchantId, // total_payout
        merchantId, // refund_count
        merchantId, // refunded_amount
        merchantId  // transactions WHERE
    ]
);



    const [

        walletResult

    ] = await db.query(

        DASHBOARD_SUMMARY_QUERIES.GET_WALLET_SUMMARY,

        [
            merchantId
        ]

    );



    return buildDashboardSummaryResponse(

        transactionResult[0] || {},

        walletResult[0] || {}

    );


};



module.exports = summaryService;