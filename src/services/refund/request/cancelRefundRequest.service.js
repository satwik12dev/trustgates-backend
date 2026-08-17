const pool = require("../../../config/pool");

const {
    getRefundRequestById,
    getRefundRequestByReference,
    lockRefundRequest,
    cancelRefundRequest,
    createCancelRefund
} = require("../helpers/request/refundRequest.helper");

const {

    validateRequestOwnership,

    validateCancelRequest

} = require("../helpers/request/validaiton.helper");

const {

    buildRefundRequestResponse

} = require("../helpers/request/response.helper");

const {

    createAuditLog

} = require("../helpers/common/audit.helper");

const generateCancelCode = require("../../../utils/refund/genCancelCode")

// ==========================================================
// Cancel Refund Request
// ==========================================================

const cancelRefundRequestService = async (

    merchantId,

    requestReference,

    data

) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // ==================================================
        // Get Refund Request
        // ==================================================

        const refundRequest = await getRefundRequestByReference(

            connection,

            requestReference

        );

        // ==================================================
        // Lock Refund Request
        // ==================================================

        await lockRefundRequest(

            connection,

            refundRequest.request_id

        );

        // ==================================================
        // Validate Ownership
        // ==================================================

        validateRequestOwnership(

            merchantId,

            refundRequest

        );

        // ==================================================
        // Validate Cancel
        // ==================================================

        validateCancelRequest(

            refundRequest

        );

        // ==================================================
        // Cancel Refund Request
        // ==================================================

        await cancelRefundRequest(

            connection,

            refundRequest.request_id,

            merchantId,

            data.remarks

        );

        const CancelCode = generateCancelCode();
            
        await createRejectedRefund(
            connection,
            {
                requestId: refundRequest.request_id,
                refundReference: refundRequest.request_reference,
                merchantId: refundRequest.merchant_id,
                transactionId: refundRequest.transaction_id,
                amount: refundRequest.requested_amount,
                currency: refundRequest.currency,
                refundType: refundRequest.refund_type,

                // Ye refund request se hi lo
                refundReason: refundRequest.reason,

                failureCode: CancelCode,

                // Merchant ke remarks
                failureMessage:
                    data.remarks || "Refund request Cancelled due to policy violation by merchant.",
            }
        );

        // ==================================================
        // Create Audit Log
        // ==================================================

        await createAuditLog(

            connection,

            {

                requestId:

                    refundRequest.request_id,

                oldStatus:

                    refundRequest.status,

                newStatus:

                    "CANCELLED",

                action:

                    "CANCELLED",

                performedBy:

                    merchantId,

                performerType:

                    "MERCHANT",

                remarks:

                    data.remarks ||

                    "Refund request cancelled.",

                metadata: {

                    transactionReference:

                        refundRequest.transaction_reference,

                    requestedAmount:

                        refundRequest.requested_amount

                }

            }

        );

        // ==================================================
        // Get Updated Refund Request
        // ==================================================

        const updatedRefundRequest = await getRefundRequestById(

            connection,

            refundRequest.request_id

        );

        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();

        return buildRefundRequestResponse(

            updatedRefundRequest

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

module.exports = cancelRefundRequestService;