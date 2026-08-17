const db = require(
    "../../../config/pool"
);


const PAYMENT_HISTORY_QUERIES = require(
    "../../../queries/merchant/payment/paymentHistory.query"
);


const {

    buildPaymentHistoryResponse

} = require(
    "../../../utils/merchant/payment/paymentResponse.helper"
);



// ==========================================================
// Payment History Service
// ==========================================================

const paymentHistoryService = async (

    merchantId,

    filters

) => {


    const page = Number(

        filters.page || 1

    );


    const limit = Number(

        filters.limit || 20

    );


    const offset =

        (page - 1) * limit;



    let query =

        PAYMENT_HISTORY_QUERIES
            .GET_PAYMENT_HISTORY;



    let queryParams = [

        merchantId,

        limit,

        offset

    ];



    // ======================================================
    // Count Query
    // ======================================================

    const [

        countResult

    ] = await db.query(


        PAYMENT_HISTORY_QUERIES
            .COUNT_PAYMENT_HISTORY,


        [

            merchantId

        ]

    );



    // ======================================================
    // Fetch Payment History
    // ======================================================

    const [

        transactions

    ] = await db.query(

        query,

        queryParams

    );



    return buildPaymentHistoryResponse(

        transactions,

        {

            page,

            limit,

            total:

                Number(

                    countResult[0].total

                )

        }

    );


};



module.exports = paymentHistoryService;