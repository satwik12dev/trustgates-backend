const db = require(
    "../../../config/pool"
);


const DASHBOARD_ANALYTICS_QUERIES = require(
    "../../../queries/merchant/dashboard/analytics.query"
);


const {

    buildDashboardAnalyticsResponse

} = require(
    "../../../utils/merchant/dashboard/analyticsResponse.helper"
);



// ==========================================================
// Dashboard Analytics Service
// ==========================================================

const analyticsService = async (

    merchantId

) => {


    const [

        revenueTrend

    ] = await db.query(

        DASHBOARD_ANALYTICS_QUERIES.GET_REVENUE_TREND,

        [
            merchantId
        ]

    );



    const [

        paymentMethods

    ] = await db.query(

        DASHBOARD_ANALYTICS_QUERIES.GET_PAYMENT_METHOD_DISTRIBUTION,

        [
            merchantId
        ]

    );



    const [

        statusDistribution

    ] = await db.query(

        DASHBOARD_ANALYTICS_QUERIES.GET_PAYMENT_STATUS_DISTRIBUTION,

        [
            merchantId
        ]

    );



    const [

        successRate

    ] = await db.query(

        DASHBOARD_ANALYTICS_QUERIES.GET_PAYMENT_SUCCESS_RATE,

        [
            merchantId
        ]

    );



    const [

        averageAmount

    ] = await db.query(

        DASHBOARD_ANALYTICS_QUERIES.GET_AVERAGE_TRANSACTION_AMOUNT,

        [
            merchantId
        ]

    );



    return buildDashboardAnalyticsResponse(

        revenueTrend,

        paymentMethods,

        statusDistribution,

        successRate[0],

        averageAmount[0]

    );


};



module.exports = analyticsService;