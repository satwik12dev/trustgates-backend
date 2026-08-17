// ==========================================================
// Success Response
// ==========================================================

const successResponse = (

    message,

    data = null

) => {

    return {

        success: true,

        message,

        data

    };

};

// ==========================================================
// Error Response
// ==========================================================

const errorResponse = (

    message,

    errors = null

) => {

    return {

        success: false,

        message,

        errors

    };

};

// ==========================================================
// Processor Response
// ==========================================================

const buildProcessorResponse = (

    request,

    refund

) => {

    return {

        requestReference:

            request.request_reference,

        refundReference:

            refund.refund_reference,

        gatewayRefundId:

            refund.gateway_refund_id,

        refundStatus:

            refund.refund_status,

        processedAmount:

            refund.processed_amount,

        completionSource:

            refund.completion_source

    };

};

// ==========================================================
// Webhook Response
// ==========================================================

const buildWebhookResponse = (

    request,

    refund

) => {

    return {

        requestReference:

            request.request_reference,

        refundReference:

            refund.refund_reference,

        gatewayRefundId:

            refund.gateway_refund_id,

        requestStatus:

            request.status,

        refundStatus:

            refund.refund_status,

        processedAmount:

            refund.processed_amount

    };

};

// ==========================================================
// Export
// ==========================================================

module.exports = {

    successResponse,

    errorResponse,

    buildProcessorResponse,

    buildWebhookResponse

};