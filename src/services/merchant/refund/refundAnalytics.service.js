const pool = require(
    "../../../config/pool"
);


const REFUND_ANALYTICS_QUERIES = require(
    "../../../queries/merchant/refund/refundAnalytics.query"
);



const {
    buildRefundAnalyticsResponse
} = require(
    "../../../utils/merchant/refund/refundAnalytics.helper"
);



// ==========================================================
// Refund Analytics Service
// ==========================================================

const refundAnalyticsService = async (

    merchantId

) => {


    const connection = await pool.getConnection();


    try {


        const [
            summary
        ] = await connection.query(

            REFUND_ANALYTICS_QUERIES.SUMMARY,

            [

                merchantId

            ]

        );



        const [
            trend
        ] = await connection.query(

            REFUND_ANALYTICS_QUERIES.MONTHLY_TREND,

            [

                merchantId

            ]

        );



        return buildRefundAnalyticsResponse(

            summary[0],

            trend

        );


    }


    finally {


        connection.release();


    }


};



module.exports = refundAnalyticsService;