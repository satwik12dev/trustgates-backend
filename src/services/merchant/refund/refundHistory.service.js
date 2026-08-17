const pool = require(
    "../../../config/pool"
);


const REFUND_HISTORY_QUERIES = require(
    "../../../queries/merchant/refund/refundHistory.query"
);


const {
    buildRefundHistoryResponse,
    formatRefund
} = require(
    "../../../utils/merchant/refund/refundResponse.helper"
);

// ==========================================================
// Refund History Service
// ==========================================================

const refundHistoryService = async (

    merchantId,

    filters

) => {


    const connection = await pool.getConnection();


    try {


        const page =

            Number(filters.page || 1);



        const limit =

            Number(filters.limit || 20);



        const offset =

            (page - 1) * limit;



        const [
            refunds
        ] = await connection.query(

            REFUND_HISTORY_QUERIES.GET_REFUND_HISTORY,

            [

                merchantId,

                limit,

                offset

            ]

        );



        const [
            countResult
        ] = await connection.query(

            REFUND_HISTORY_QUERIES.GET_REFUND_COUNT,

            [

                merchantId

            ]

        );



        return buildRefundHistoryResponse(

            refunds.map(formatRefund),

            {

                page,

                limit,

                total:

                    Number(
                        countResult[0].total
                    )

            }

        );


    }


    finally {


        connection.release();


    }


};



module.exports = refundHistoryService;