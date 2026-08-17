// ==========================================================
// Build Refund Request Response
// ==========================================================

const buildRefundRequestResponse = (refundRequest) => {

    return {

        requestId:
            refundRequest.request_id,

        requestReference:
            refundRequest.request_reference,

        transactionReference:
            refundRequest.transaction_reference,

        amount:
            Number(refundRequest.requested_amount),

        status:
            refundRequest.status,

        refundStatus:
            refundRequest.status === "REQUESTED" ||
            refundRequest.status === "APPROVED" ||
            refundRequest.status === "PROCESSING"
                ? "processing"
                : refundRequest.status === "COMPLETED"
                ? "refunded"
                : "failed",

        createdAt:
            refundRequest.created_at

    };

};


// ==========================================================
// Build Refund Request List Response
// ==========================================================

const buildRefundRequestListResponse = (

    requests,

    total,

    page,

    limit

) => {

    return {

        total,

        page,

        limit,

        totalPages:

            Math.ceil(

                total / limit

            ),

        requests:

            requests.map(

                buildRefundRequestResponse

            )

    };

};

// ==========================================================
// Export
// ==========================================================

module.exports = {

    buildRefundRequestResponse,

    buildRefundRequestListResponse

};