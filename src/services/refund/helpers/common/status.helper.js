const {

    ConflictError

} = require("../../../../utils/errors");

// ==========================================================
// Can Approve
// ==========================================================

const canApprove = (

    request

) => {

    return request.status === "REQUESTED";

};

// ==========================================================
// Can Reject
// ==========================================================

const canReject = (

    request

) => {

    return request.status === "REQUESTED";

};

// ==========================================================
// Can Cancel
// ==========================================================

const canCancel = (

    request

) => {

    return request.status === "REQUESTED";

};

// ==========================================================
// Can Process
// ==========================================================

const canProcess = (

    request

) => {

    return request.status === "APPROVED";

};

// ==========================================================
// Can Complete
// ==========================================================

const canComplete = (

    request

) => {

    return request.status === "PROCESSING";

};

// ==========================================================
// Can Fail
// ==========================================================

const canFail = (

    request

) => {

    return (

        request.status === "PROCESSING" ||

        request.status === "APPROVED"

    );

};

// ==========================================================
// Is Requested
// ==========================================================

const isRequested = (

    request

) => {

    return request.status === "REQUESTED";

};

// ==========================================================
// Is Approved
// ==========================================================

const isApproved = (

    request

) => {

    return request.status === "APPROVED";

};

// ==========================================================
// Is Processing
// ==========================================================

const isProcessing = (

    request

) => {

    return request.status === "PROCESSING";

};

// ==========================================================
// Is Completed
// ==========================================================

const isCompleted = (

    request

) => {

    return request.status === "COMPLETED";

};

// ==========================================================
// Is Failed
// ==========================================================

const isFailed = (

    request

) => {

    return request.status === "FAILED";

};

// ==========================================================
// Assert Can Approve
// ==========================================================

const assertCanApprove = (

    request

) => {

    if (

        !canApprove(

            request

        )

    ) {

        throw new ConflictError(

            "Refund request cannot be approved."

        );

    }

};

// ==========================================================
// Assert Can Reject
// ==========================================================

const assertCanReject = (

    request

) => {

    if (

        !canReject(

            request

        )

    ) {

        throw new ConflictError(

            "Refund request cannot be rejected."

        );

    }

};

// ==========================================================
// Assert Can Cancel
// ==========================================================

const assertCanCancel = (

    request

) => {

    if (

        !canCancel(

            request

        )

    ) {

        throw new ConflictError(

            "Refund request cannot be cancelled."

        );

    }

};

// ==========================================================
// Assert Can Process
// ==========================================================

const assertCanProcess = (refundRequest)=>{

    const allowedStatus = [
        "APPROVED",
        "PROCESSING"
    ];


    if(!allowedStatus.includes(refundRequest.status)){

        throw new Error(
            "Refund request cannot be processed."
        );

    }

};

// ==========================================================
// Assert Can Complete
// ==========================================================

const assertCanComplete = (

    request

) => {

    if (

        !canComplete(

            request

        )

    ) {

        throw new ConflictError(

            "Refund request cannot be completed."

        );

    }

};

// ==========================================================
// Assert Can Fail
// ==========================================================

const assertCanFail = (

    request

) => {

    if (

        !canFail(

            request

        )

    ) {

        throw new ConflictError(

            "Refund request cannot be marked as failed."

        );

    }

};

// ==========================================================
// Export
// ==========================================================

module.exports = {

    canApprove,
    canReject,
    canCancel,

    canProcess,
    canComplete,
    canFail,

    isRequested,
    isApproved,
    isProcessing,
    isCompleted,
    isFailed,

    assertCanApprove,
    assertCanReject,
    assertCanCancel,

    assertCanProcess,
    assertCanComplete,
    assertCanFail

};