const db = require(
    "../../../config/pool"
);


const WALLET_DASHBOARD_QUERIES = require(
    "../../../queries/merchant/dashboard/wallet.query"
);


const {

    buildWalletDashboardResponse

} = require(
    "../../../utils/merchant/dashboard/walletResponse.helper"
);



// ==========================================================
// Merchant Dashboard Wallet Service
// ==========================================================

const walletService = async (

    merchantId

) => {


    // ==========================================
    // Wallet Overview
    // ==========================================

    const [

        walletResult

    ] = await db.query(

        WALLET_DASHBOARD_QUERIES.GET_WALLET_OVERVIEW,

        [
            merchantId
        ]

    );



    // ==========================================
    // Wallet Transaction Summary
    // ==========================================

    const [

        transactionSummaryResult

    ] = await db.query(

        WALLET_DASHBOARD_QUERIES.GET_WALLET_TRANSACTION_SUMMARY,

        [
            merchantId
        ]

    );



    return buildWalletDashboardResponse(

        walletResult[0] || {},

        transactionSummaryResult[0] || {}

    );


};



module.exports = walletService;