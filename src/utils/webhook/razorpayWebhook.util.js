const crypto = require("crypto");

// ==========================================================
// Razorpay Webhook Signature Verification
// ==========================================================

const verifyRazorpayWebhookSignature = (
    rawBody,
    signature,
    webhookSecret
) => {

    if (
        !rawBody ||
        !signature ||
        !webhookSecret
    ) {
        return false;
    }

    const expectedSignature =
        crypto
            .createHmac(
                "sha256",
                webhookSecret
            )
            .update(rawBody)
            .digest("hex");

    try {

        return crypto.timingSafeEqual(
            Buffer.from(signature, "utf8"),
            Buffer.from(expectedSignature, "utf8")
        );

    } catch (error) {

        return false;
    }
};


// ==========================================================
// Razorpay Webhook Event Parser
// ==========================================================

const parseRazorpayWebhook = (
    payload
) => {

    if (
        !payload ||
        typeof payload !== "object"
    ) {
        return null;
    }

    const event =
        payload.event || null;

    const paymentEntity =
        payload?.payload?.payment?.entity || null;

    const orderEntity =
        payload?.payload?.order?.entity || null;

    if (!paymentEntity) {
        return null;
    }

    return {
        event,

        paymentId:
            paymentEntity.id || null,

        orderId:
            paymentEntity.order_id ||
            orderEntity?.id ||
            null,

        amount:
            paymentEntity.amount != null
                ? Number(paymentEntity.amount) / 100
                : null,

        currency:
            paymentEntity.currency || "INR",

        status:
            paymentEntity.status || null,

        method:
            paymentEntity.method || null,

        email:
            paymentEntity.email || null,

        contact:
            paymentEntity.contact || null,

        vpa:
            paymentEntity.vpa || null,

        bank:
            paymentEntity.bank || null,

        wallet:
            paymentEntity.wallet || null,

        cardId:
            paymentEntity.card_id || null,

        acquirerData:
            paymentEntity.acquirer_data || {},

        errorCode:
            paymentEntity.error_code || null,

        errorDescription:
            paymentEntity.error_description || null,

        errorReason:
            paymentEntity.error_reason || null,

        rawPayload:
            payload
    };
};


// ==========================================================
// Razorpay Payment Method Mapper
// ==========================================================

const mapRazorpayPaymentMethod = (
    method
) => {

    switch (String(method || "").toLowerCase()) {

        case "upi":
            return "UPI";

        case "card":
            return "CARD";

        case "netbanking":
            return "NETBANKING";

        case "wallet":
            return "WALLET";

        case "emi":
            return "EMI";

        case "paylater":
            return "PAYLATER";

        default:
            return null;
    }
};


// ==========================================================
// Razorpay Status Mapper
// ==========================================================

const mapRazorpayStatus = (
    event,
    paymentStatus
) => {

    const normalizedEvent =
        String(event || "").toLowerCase();

    const normalizedStatus =
        String(paymentStatus || "").toLowerCase();

    if (
        normalizedEvent.includes("captured") ||
        normalizedStatus === "captured"
    ) {
        return "SUCCESS";
    }

    if (
        normalizedEvent.includes("failed") ||
        normalizedStatus === "failed"
    ) {
        return "FAILED";
    }

    if (
        normalizedEvent.includes("authorized") ||
        normalizedStatus === "authorized"
    ) {
        return "AUTHORIZED";
    }

    if (
        normalizedStatus === "created"
    ) {
        return "CREATED";
    }

    return "PENDING";
};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    verifyRazorpayWebhookSignature,

    parseRazorpayWebhook,

    mapRazorpayPaymentMethod,

    mapRazorpayStatus

};