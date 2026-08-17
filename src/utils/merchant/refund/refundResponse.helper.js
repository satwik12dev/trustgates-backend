// ==========================================================
// Refund History Response
// ==========================================================

const buildRefundHistoryResponse = (

    refunds,

    pagination

) => {

    return {

        success: true,

        data: {

            refunds,

            pagination

        }

    };

};


// ==========================================================
// Format Refund / Payout
// ==========================================================

const formatRefund = (

    refund

) => {

    return {

        refundId:
            refund.refund_id,


        refundReference:
            refund.refund_reference ||
            refund.request_reference ||
            "N/A",


        transactionReference:
            refund.transaction_reference ||
            "N/A",


        orderId:
            refund.order_id ||
            refund.gateway_order_id ||
            "N/A",


        amount:
            Number(
                refund.amount ||
                refund.approved_amount ||
                0
            ),


        feeAmount:
            Number(
                refund.fee_amount ||
                0
            ),


        totalDebitAmount:
            Number(
                refund.total_debit_amount ||
                0
            ),


        currency:
            refund.currency ||
            "INR",


        refundType:
            refund.refund_type ||
            "N/A",


        status:
            refund.refund_status ||
            refund.request_status ||
            "N/A",


        gatewayRefundId:
            refund.gateway_refund_id ||
            null,


        gatewayPaymentId:
            refund.gateway_payment_id ||
            null,


        gatewayOrderId:
            refund.gateway_order_id ||
            null,


        paymentMethod:
            refund.payment_method ||
            "N/A",


        paymentType:
            refund.payment_type ||
            "N/A",


        transactionAmount:
            Number(
                refund.transaction_amount ||
                0
            ),


        reason:
            refund.refund_reason ||
            refund.request_reason ||
            null,


        completionSource:
            refund.completion_source ||
            null,


        failureCode:
            refund.failure_code ||
            null,


        failureMessage:
            refund.failure_message ||
            null,


        processedAt:
            refund.processed_at ||
            null,


        createdAt:
            refund.created_at,


        updatedAt:
            refund.updated_at

    };

};


module.exports = {

    buildRefundHistoryResponse,

    formatRefund

};