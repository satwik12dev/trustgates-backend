const pool = require("../../../config/pool");

const {
    ConflictError
} = require("../../../utils/errors");

const {

    getTransaction,

    lockTransaction,

    getRefundedAmount,
    getTotalRefundRequested

} = require("../helpers/request/trasaction.helper");

const {

    createRefundRequest,
    checkPendingRequest,
    getRefundRequestById,
    checkCompletedRefundByTransaction

} = require("../helpers/request/refundRequest.helper");
const {

    calculateRemainingAmount,

    getRefundType,

    validateRequestedAmount

} = require("../helpers/request/calculation.helper");

const {

    validateRefundEligibleTransaction,

    validatePendingRequest

} = require("../helpers/request/validaiton.helper");

const {

    buildRefundRequestResponse

} = require("../helpers/request/response.helper");

const {

    createAuditLog

} = require("../helpers/common/audit.helper");

const generateRequestReference = require("../../../utils/refund/generateRefundReference");

// ==========================================================
// Create Refund Request
// ==========================================================

const createRefundRequestService = async (

    merchantId,

    data

) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // ==================================================
        // Fetch Transaction
        // ==================================================
        console.log(merchantId, data.transactionRef);
        const transaction = await getTransaction(

            connection,

            merchantId,

            data.transactionRef
        );
        
        const totalRefundRequested = await getTotalRefundRequested(
            connection,
            transaction.transaction_id
        );

        // ==================================================
        // Lock Transaction
        // ==================================================

        await lockTransaction(

            connection,

            transaction.transaction_id

        );
        
        if (
            totalRefundRequested >= Number(transaction.amount)
        ) {

            throw new ConflictError(
                "Transaction already fully refunded."
            );

        }


        if (
            totalRefundRequested + Number(data.requestedAmount)
            > Number(transaction.amount)
        ) {

            throw new ConflictError(
                "Refund amount exceeds available transaction amount."
            );

        }


        // ==================================================
        // Validate Transaction
        // ==================================================

        validateRefundEligibleTransaction(

            transaction

        );

        // ==================================================
        // Check Pending Refund Request
        // ==================================================

        const pendingRequest = await checkPendingRequest(

            connection,

            merchantId,

            transaction.transaction_id

        );

        validatePendingRequest(

            pendingRequest

        );

        // ==================================================
        // Calculate Refunded Amount
        // ==================================================

        const refundedAmount = await getRefundedAmount(

            connection,

            transaction.transaction_id

        );

        // ==================================================
        // Validate Requested Amount
        // ==================================================

        validateRequestedAmount(

            transaction.amount,

            refundedAmount,

            data.requestedAmount

        );

        // ==================================================
        // Remaining Amount
        // ==================================================

        const remainingAmount = calculateRemainingAmount(

            transaction.amount,

            refundedAmount

        );

        // ==================================================
        // Refund Type
        // ==================================================

        const refundType = getRefundType(

            transaction.amount,

            refundedAmount,

            data.requestedAmount

        );

        // ==================================================
        // Request Reference
        // ==================================================

        const requestReference = await generateRequestReference();
        // ==================================================
        // Create Refund Request
        // ==================================================

        const requestId = await createRefundRequest(

            connection,

            {

                requestReference,

                merchantId,

                transactionId:

                    transaction.transaction_id,

                transactionReference:

                    transaction.transaction_ref,

                requestedAmount:

                    data.requestedAmount,

                approvedAmount:

                    null,

                currency:

                    transaction.currency,

                refundType,

                reason:

                    data.reason,

                source:

                    data.source ||

                    "MERCHANT",

                requestedBy:

                    merchantId,

                metadata:

                    data.metadata || {}

            }

        );

        // ==================================================
        // Create Audit Log
        // ==================================================

        await createAuditLog(

            connection,

            {

                requestId,

                oldStatus:

                    null,

                newStatus:

                    "REQUESTED",

                action:

                    "CREATED",

                performedBy:

                    merchantId,

                performerType:

                    "MERCHANT",

                remarks:

                    "Refund request created.",

                metadata: {

                    transactionReference:

                        transaction.transaction_ref,

                    requestedAmount:

                        data.requestedAmount,

                    remainingAmount

                }

            }

        );

        // ==================================================
        // Fetch Created Request
        // ==================================================
        // ==================================================
        // Fetch Created Refund Request
        // ==================================================

        const refundRequest = await getRefundRequestById(

            connection,

            requestId

        );

        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();

        return buildRefundRequestResponse(

            refundRequest

        );
    }

    catch (

    error

    ) {

        await connection.rollback();

        throw error;

    }

    finally {

        connection.release();

    }

};

// ==========================================================
// Export
// ==========================================================

module.exports = createRefundRequestService;