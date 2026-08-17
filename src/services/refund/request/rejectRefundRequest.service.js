const pool = require("../../../config/pool");

const {

    getRefundRequestById,

    getRefundRequestByReference,

    lockRefundRequest,

    rejectRefundRequest,

    createRejectedRefund,

    createCancelRefund

} = require("../helpers/request/refundRequest.helper");

const {

    validateRequestOwnership,

    validateRejectRequest

} = require("../helpers/request/validaiton.helper");

const {

    buildRefundRequestResponse

} = require("../helpers/request/response.helper");


const {

    createAuditLog

} = require("../helpers/common/audit.helper");
const generateFailureCode = require("../../../utils/refund/genFailCode");

// ==========================================================
// Reject Refund Request
// ==========================================================

const rejectRefundRequestService = async (

    merchantId,

    requestId,

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

            requestId

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
        // Validate Request Status
        // ==================================================

        validateRejectRequest(

            refundRequest

        );

        // ==================================================
        // Reject Refund Request
        // ==================================================

        await rejectRefundRequest(

            connection,

            refundRequest.request_id,

            merchantId,

            data.remarks

        );
        const failure_code = generateFailureCode();
            
        await createCancelRefund(
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

                failureCode: failure_code,

                // Merchant ke remarks
                failureMessage:
                    data.remarks || "Refund request rejected by merchant.",
                
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

                    "REJECTED",

                action:

                    "REJECTED",

                performedBy:

                    merchantId,

                performerType:

                    "MERCHANT",

                remarks:

                    data.remarks ||

                    "Refund request rejected.",

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

module.exports = rejectRefundRequestService;