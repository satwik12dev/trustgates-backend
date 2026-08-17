const REFUND_REQUEST_QUERIES = require("../../../../queries/refund/refundRequest.query");
const REFUND_PROCESSOR_QUERIES= require("../../../../queries/refund/refundProcessor.query")
const {

    NotFoundError

} = require("../../../../utils/errors");

// ==========================================================
// Create Refund Request
// ==========================================================

const createRefundRequest = async (

    connection,

    request

) => {

    const [result] = await connection.query(

        REFUND_REQUEST_QUERIES.CREATE_REFUND_REQUEST,

        [

            request.requestReference,

            request.merchantId,

            request.transactionId,

            request.transactionReference,

            request.requestedAmount,

            request.approvedAmount,

            request.currency,

            request.refundType,

            request.reason,

            request.source,

            request.requestedBy,

            JSON.stringify(

                request.metadata || {}

            )

        ]

    );

    return result.insertId;

};

// ==========================================================
// Get Refund Request By ID
// ==========================================================

const getRefundRequestById = async (

    connection,

    requestId

) => {
    console.log("REQUEST ID:", requestId);


    const [requests] = await connection.query(

        REFUND_REQUEST_QUERIES.GET_REFUND_REQUEST_BY_ID,

        [

            requestId

        ]

    );

    if (

        !requests.length

    ) {

        throw new NotFoundError(

            "Refund request not found."

        );

    }

    return requests[0];

};

// ==========================================================
// Get Refund Request By Reference
// ==========================================================

const getRefundRequestByReference = async (

    connection,
    requestId

) => {

    const [requests] = await connection.query(

        REFUND_REQUEST_QUERIES.GET_REFUND_REQUEST_BY_ID,

        [

            requestId

        ]

    );

    if (

        !requests.length

    ) {

        throw new NotFoundError(

            "Refund request not found."

        );

    }

    return requests[0];

};

// ==========================================================
// Get Refund Requests By Transaction
// ==========================================================

const getRefundRequestsByTransaction = async (

    connection,

    transactionId

) => {

    const [requests] = await connection.query(

        REFUND_REQUEST_QUERIES.GET_REQUEST_BY_TRANSACTION,

        [

            transactionId

        ]

    );

    return requests;

};

// ==========================================================
// Check Existing Pending Request
// ==========================================================

const checkPendingRequest = async (

    connection,

    merchantId,

    transactionId

) => {

    const [requests] = await connection.query(

        REFUND_REQUEST_QUERIES.CHECK_EXISTING_PENDING_REQUEST,

        [

            merchantId,

            transactionId

        ]

    );

    return requests[0] || null;

};

// ==========================================================
// Lock Refund Request
// ==========================================================

const lockRefundRequest = async (

    connection,

    requestId

) => {

    const [requests] = await connection.query(

        REFUND_REQUEST_QUERIES.LOCK_REFUND_REQUEST,

        [

            requestId

        ]

    );

    if (

        !requests.length

    ) {

        throw new NotFoundError(

            "Refund request not found."

        );

    }

    return requests[0];

};

// ==========================================================
// Approve Refund Request
// ==========================================================

const approveRefundRequest = async (
    connection,
    requestId,
    approvedAmount,
    feeAmount,
    totalDebitAmount,
    approvedBy,
    remarks
) => {

    const [result] = await connection.query(
        REFUND_REQUEST_QUERIES.APPROVE_REFUND_REQUEST,
        [
            approvedAmount,
            feeAmount,
            totalDebitAmount,
            approvedBy,
            remarks,
            requestId
        ]
    );

    return result;
};

// ==========================================================
// Reject Refund Request
// ==========================================================

const rejectRefundRequest = async (

    connection,

    requestId,

    rejectedBy,

    remarks

) => {

    await connection.query(

        REFUND_REQUEST_QUERIES.REJECT_REFUND_REQUEST,

        [

            rejectedBy,

            remarks || null,

            requestId

        ]

    );

    

};

// ==========================================================
// Cancel Refund Request
// ==========================================================

const cancelRefundRequest = async (

    connection,

    requestId,

    cancelledBy,

    remarks

) => {

    await connection.query(

        REFUND_REQUEST_QUERIES.CANCEL_REFUND_REQUEST,

        [

            cancelledBy,

            remarks || null,

            requestId

        ]

    );

};

// ==========================================================
// Update Request Status
// ==========================================================

const updateRequestStatus = async (

    connection,

    requestId,

    status,

    processedAmount = null

) => {

    await connection.query(

        REFUND_REQUEST_QUERIES.UPDATE_REQUEST_STATUS,

        [

            status,

            processedAmount,

            requestId

        ]

    );

};

// ==========================================================
// List Refund Requests
// ==========================================================

const listRefundRequests = async (

    connection,

    merchantId,

    limit,

    offset

) => {

    const [requests] = await connection.query(

        REFUND_REQUEST_QUERIES.LIST_REFUND_REQUESTS,

        [

            merchantId,

            limit,

            offset

        ]

    );

    return requests;

};

// ==========================================================
// Count Refund Requests
// ==========================================================

const countRefundRequests = async (

    connection,

    merchantId

) => {

    const [rows] = await connection.query(

        REFUND_REQUEST_QUERIES.COUNT_REFUND_REQUESTS,

        [

            merchantId

        ]

    );

    return rows[0].total;

};

// ==========================================================
// Get Approved Requests (Worker)
// ==========================================================

const getApprovedRequests = async (

    connection,

    limit

) => {

    const [requests] = await connection.query(

        REFUND_REQUEST_QUERIES.GET_APPROVED_REQUESTS,

        [

            limit

        ]

    );

    return requests;

};
const checkCompletedRefundByTransaction = async (

    connection,

    transactionId

) => {

    const [rows] = await connection.query(

        `
        SELECT 
            request_id
        FROM refund_requests
        WHERE transaction_id = ?
        AND status = 'COMPLETED'
        LIMIT 1
        `,

        [
            transactionId
        ]

    );

    return rows.length > 0;

};

const createRejectedRefund = async (
    connection,
    refund
) => {

    const [result] = await connection.query(
        REFUND_PROCESSOR_QUERIES.CREATE_REJECTED_REFUND,
        [
            refund.requestId,
            refund.refundReference,
            refund.merchantId,
            refund.transactionId,
            refund.amount,
            refund.currency,
            refund.reason,
            refund.failureCode,
            refund.failureMessage
        ]
    );

    return result.insertId;

};

const createCancelRefund = async (
    connection,
    refund
) => {

    const [result] = await connection.query(
        REFUND_PROCESSOR_QUERIES.CREATE_CANCLE_REFUND,
        [
            refund.requestId,
            refund.refundReference,
            refund.merchantId,
            refund.transactionId,
            refund.amount,
            refund.currency,
            refund.reason,
            refund.failureCode,
            refund.failureMessage
        ]
    );

    return result.insertId;

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    createRefundRequest,

    getRefundRequestById,

    getRefundRequestByReference,

    getRefundRequestsByTransaction,

    checkPendingRequest,

    lockRefundRequest,

    approveRefundRequest,

    rejectRefundRequest,

    cancelRefundRequest,

    updateRequestStatus,

    listRefundRequests,

    countRefundRequests,

    getApprovedRequests,

    checkCompletedRefundByTransaction,
    createRejectedRefund,
    createCancelRefund

};