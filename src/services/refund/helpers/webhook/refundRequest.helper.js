const {

    getRefundRequestById,

    lockRefundRequest

} = require("../request/refundRequest.helper");

const {

    completeRefundRequest,

    failRefundRequest

} = require("../processor/refund.helper");

// ==========================================================
// Get Refund Request
// ==========================================================

const getRefundRequest = (

    connection,

    requestId

) => {

    return getRefundRequestById(

        connection,

        requestId

    );

};

// ==========================================================
// Lock Refund Request
// ==========================================================

const lockRequest = (

    connection,

    requestId

) => {

    return lockRefundRequest(

        connection,

        requestId

    );

};

// ==========================================================
// Complete Refund Request
// ==========================================================

const completeRequest = (

    connection,

    requestId,

    processedAmount

) => {

    return completeRefundRequest(

        connection,

        requestId,

        processedAmount

    );

};

// ==========================================================
// Fail Refund Request
// ==========================================================

const failRequest = (

    connection,

    requestId,

    remarks

) => {

    return failRefundRequest(

        connection,

        requestId,

        remarks

    );

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    getRefundRequest,

    lockRequest,

    completeRequest,

    failRequest

};