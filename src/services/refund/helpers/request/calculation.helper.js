const {

    BadRequestError

} = require("../../../../utils/errors");

// ==========================================================
// Calculate Remaining Refundable Amount
// ==========================================================

const calculateRemainingAmount = (

    transactionAmount,

    refundedAmount

) => {

    return Number(

        transactionAmount

    ) - Number(

        refundedAmount

    );

};

// ==========================================================
// Calculate Total Refunded Amount
// ==========================================================

const calculateTotalRefundedAmount = (

    refundedAmount,

    currentRefundAmount

) => {

    return Number(

        refundedAmount

    ) + Number(

        currentRefundAmount

    );

};

// ==========================================================
// Determine Refund Type
// ==========================================================

const getRefundType = (

    transactionAmount,

    refundedAmount,

    refundAmount

) => {

    const remainingAmount = calculateRemainingAmount(

        transactionAmount,

        refundedAmount

    );

    return Number(

        refundAmount

    ) === Number(

        remainingAmount

    )

        ? "FULL"

        : "PARTIAL";

};

// ==========================================================
// Check Fully Refunded
// ==========================================================

const isFullyRefunded = (

    transactionAmount,

    refundedAmount

) => {

    return Number(

        refundedAmount

    ) >= Number(

        transactionAmount

    );

};

// ==========================================================
// Check Partial Refund
// ==========================================================

const isPartialRefund = (

    transactionAmount,

    refundedAmount

) => {

    return (

        Number(

            refundedAmount

        ) > 0

        &&

        Number(

            refundedAmount

        ) <

        Number(

            transactionAmount

        )

    );

};

// ==========================================================
// Validate Requested Amount
// ==========================================================

const validateRequestedAmount = (

    transactionAmount,

    refundedAmount,

    requestedAmount

) => {

    const remainingAmount = calculateRemainingAmount(

        transactionAmount,

        refundedAmount

    );

    if (

        Number(

            requestedAmount

        ) <= 0

    ) {

        throw new BadRequestError(

            "Requested amount must be greater than zero."

        );

    }

    if (

        Number(

            requestedAmount

        ) >

        Number(

            remainingAmount

        )

    ) {

        throw new BadRequestError(

            "Requested amount exceeds refundable amount."

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

    calculateRemainingAmount,

    calculateTotalRefundedAmount,

    getRefundType,

    isFullyRefunded,

    isPartialRefund,

    validateRequestedAmount,

    validateApprovedAmount

};