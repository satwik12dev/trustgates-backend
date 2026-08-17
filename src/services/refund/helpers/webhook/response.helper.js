// ==========================================================
// Build Webhook Success Response
// ==========================================================

const buildWebhookSuccessResponse = (

    refundRequest,

    gatewayRefund

) => {

    return {

        success: true,

        requestReference:

            refundRequest.request_reference,

        refundReference:

            gatewayRefund.refund_reference,

        gatewayRefundId:

            gatewayRefund.gateway_refund_id,

        status:

            gatewayRefund.refund_status,

        message:

            "Refund webhook processed successfully."

    };

};

// ==========================================================
// Build Webhook Ignored Response
// ==========================================================

const buildWebhookIgnoredResponse = (

    reason

) => {

    return {

        success: true,

        ignored: true,

        reason,

        message:

            "Webhook ignored."

    };

};

// ==========================================================
// Build Webhook Failure Response
// ==========================================================

const buildWebhookFailureResponse = (

    error

) => {

    return {

        success: false,

        message:

            error.message

    };

};

// ==========================================================
// Export
// ==========================================================

module.exports = {

    buildWebhookSuccessResponse,

    buildWebhookIgnoredResponse,

    buildWebhookFailureResponse

};