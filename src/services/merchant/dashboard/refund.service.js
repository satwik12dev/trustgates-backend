const db = require(
    "../../../config/pool"
);


const REFUND_DASHBOARD_QUERIES = require(
    "../../../queries/merchant/dashboard/refund.query"
);


const {

    buildRefundDashboardResponse

} = require(
    "../../../utils/merchant/dashboard/refundResponse.helper"
);



// ==========================================================
// Merchant Dashboard Refund Service
// ==========================================================

const refundService = async (

    merchantId

) => {


    // ==========================================
    // Refund Summary
    // ==========================================

    const [

        summaryResult

    ] = await db.query(

        REFUND_DASHBOARD_QUERIES.GET_REFUND_SUMMARY,

        [
            merchantId
        ]

    );



    // ==========================================
    // Refund Trend
    // ==========================================

    const [

        trendResult

    ] = await db.query(

        REFUND_DASHBOARD_QUERIES.GET_REFUND_TREND,

        [
            merchantId
        ]

    );



    // ==========================================
    // Refund Status Distribution
    // ==========================================

    const [

        statusResult

    ] = await db.query(

        REFUND_DASHBOARD_QUERIES.GET_REFUND_STATUS_DISTRIBUTION,

        [
            merchantId
        ]

    );



    return buildRefundDashboardResponse(

        summaryResult[0] || {},

        trendResult,

        statusResult

    );


};



module.exports = refundService;