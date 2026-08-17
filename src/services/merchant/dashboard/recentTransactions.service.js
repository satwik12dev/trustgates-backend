const db = require(
    "../../../config/pool"
);


const RECENT_TRANSACTIONS_QUERIES = require(
    "../../../queries/merchant/dashboard/recentTransactions.query"
);


const {

    buildRecentTransactionsResponse

} = require(
    "../../../utils/merchant/dashboard/recentTransactionsResponse.helper"
);



// ==========================================================
// Recent Transactions Service
// ==========================================================

const recentTransactionsService = async (

    merchantId,

    limit = 10

) => {


    const [

        transactions

    ] = await db.query(

        RECENT_TRANSACTIONS_QUERIES.GET_RECENT_TRANSACTIONS,

        [
            merchantId,
            limit
        ]

    );



    return buildRecentTransactionsResponse(

        transactions

    );


};



module.exports = recentTransactionsService;