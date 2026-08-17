const crypto = require("crypto");

const generateEventId = () => {
    return `evt_${crypto
        .randomBytes(16)
        .toString("hex")}`;

};
const buildWebhookPayload = (
    eventType,
    data
) => {

    if(!eventType || !data){
        throw new Error(
            "Event type and data are required."
        );
    }
    return {
        id: generateEventId(),
        event: eventType,
        createdAt: new Date().toISOString(),
        data:{
            transaction: data.transaction || null,
            refund: data.refund || null
        }
    };
};


const buildPaymentSuccessPayload = (transaction) => {
    return buildWebhookPayload(
        "payment.success",{transaction}
    );
};

const buildPaymentFailedPayload = (transaction) => {
    return buildWebhookPayload(
        "payment.failed",{transaction}
    );
};

const buildRefundProcessedPayload = (refund) => {
    return buildWebhookPayload(
        "refund.processed",{refund}
    );
};

module.exports = {
    buildWebhookPayload,
    buildPaymentSuccessPayload,
    buildPaymentFailedPayload,
    buildRefundProcessedPayload
};