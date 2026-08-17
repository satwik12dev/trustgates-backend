const {

    ConflictError,

    BadRequestError,

    UnauthorizedError

} = require("../../../../utils/errors");

// ==========================================================
// Validate Refund Eligible Transaction
// ==========================================================

const validateRefundEligibleTransaction = (

    transaction

) => {

    if (

        transaction.status !== "SUCCESS" &&

        transaction.status !== "PARTIALLY_REFUNDED"

    ) {

        throw new ConflictError(

            "Transaction is not eligible for refund."

        );

    }

};

// ==========================================================
// Validate Pending Request
// ==========================================================

const validatePendingRequest = (

    pendingRequest

) => {

    if (

        pendingRequest

    ) {

        throw new ConflictError(

            "A refund request is already in progress for this transaction."

        );

    }

};

// ==========================================================
// Validate Request Ownership
// ==========================================================

const validateRequestOwnership = (

    merchantId,

    request

) => {

    if (

        Number(

            request.merchant_id

        ) !==

        Number(

            merchantId

        )

    ) {

        throw new UnauthorizedError(

            "You are not authorized to access this refund request."

        );

    }

};

// ==========================================================
// Validate Approve Request
// ==========================================================

const validateApproveRequest = (

    request

) => {

    if (

        request.status !== "REQUESTED"

    ) {

        throw new ConflictError(

            "Only requested refunds can be approved."

        );

    }

};

// ==========================================================
// Validate Reject Request
// ==========================================================

const validateRejectRequest = (

    request

) => {

    if (

        request.status !== "REQUESTED"

    ) {

        throw new ConflictError(

            "Only requested refunds can be rejected."

        );

    }

};

// ==========================================================
// Validate Cancel Request
// ==========================================================

const validateCancelRequest = (

    request

) => {

    if (

        request.status !== "REQUESTED"

    ) {

        throw new ConflictError(

            "Only requested refunds can be cancelled."

        );

    }

};

// ==========================================================
// Validate Approved Amount
// ==========================================================

const validateApprovedAmount = (

    requestedAmount,

    approvedAmount

) => {

    if (

        Number(

            approvedAmount

        ) <= 0

    ) {

        throw new BadRequestError(

            "Approved amount must be greater than zero."

        );

    }

    if (

        Number(

            approvedAmount

        ) >

        Number(

            requestedAmount

        )

    ) {

        throw new BadRequestError(

            "Approved amount cannot exceed requested amount."

        );

    }

};

// ==========================================================
// Export
// ==========================================================

module.exports = {

    validateRefundEligibleTransaction,

    validatePendingRequest,

    validateRequestOwnership,

    validateApproveRequest,

    validateRejectRequest,

    validateCancelRequest,

    validateApprovedAmount

};