const {

    getGatewayRefundByGatewayRefundId,

    lockGatewayRefund,

    updateRefundSuccess,

    updateRefundFailure,

    updateRefundProcessing,

    getGatewayRefundByRequestId

} = require("../processor/refund.helper");

// ==========================================================
// Get Gateway Refund
// ==========================================================

const getRefund = async (

    connection,

    gatewayRefundId

) => {

    return  getGatewayRefundByGatewayRefundId(

        connection,

        gatewayRefundId

    );

};

// ==========================================================
// Lock Gateway Refund
// ==========================================================

const lockRefund = async (

    connection,

    refundId

) => {

    return  lockGatewayRefund(

        connection,

        refundId

    );

};

// ==========================================================
// Mark Refund Success
// ==========================================================

const markRefundSuccess = async (

    connection,

    refundId,

    gatewayResponse,

    completionSource

) => {

    await updateRefundSuccess(

        connection,

        refundId,

        gatewayResponse,

        completionSource

    );

};

// ==========================================================
// Mark Refund Failure
// ==========================================================

const markRefundFailure = async (

    connection,

    refundId,

    gatewayResponse,

    completionSource,

    failureCode,

    failureMessage

) => {

    await updateRefundFailure(

        connection,

        refundId,

        gatewayResponse,

        completionSource,

        failureCode,

        failureMessage

    );

};

// ==========================================================
// Get Refund By Request
// ==========================================================

const getRefundByRequest = async (

    connection,

    requestId

) => {

    return await getGatewayRefundByRequestId(

        connection,

        requestId

    );

};

// ==========================================================
// Mark Refund Processing
// ==========================================================

const markRefundProcessing = async (

    connection,

    refundId,

    gatewayResponse,

    completionSource

) => {

    await updateRefundProcessing(

        connection,

        refundId,

        gatewayResponse,

        completionSource

    );

};

// ==========================================================
// Export
// ==========================================================

module.exports = {

    getRefund,

    lockRefund,

    markRefundSuccess,

    markRefundFailure,

    getRefundByRequest,
    markRefundProcessing

};