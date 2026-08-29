const crypto = require("crypto");

// ==========================================================
// Cashfree Webhook Signature Verification
// ==========================================================

const verifyCashfreeWebhookSignature = (
    rawBody,
    signature,
    timestamp,
    webhookSecret
) => {

    if (
        !rawBody ||
        !signature ||
        !timestamp ||
        !webhookSecret
    ) {
        return false;
    }

    const signedPayload =
        `${timestamp}${rawBody}`;

    const expectedSignature =
        crypto
            .createHmac(
                "sha256",
                webhookSecret
            )
            .update(signedPayload)
            .digest("base64");

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
// Cashfree Payment Method Mapper
// ==========================================================

const mapCashfreePaymentMethod = (
    paymentMethod
) => {

    const method =
        String(paymentMethod || "")
            .toLowerCase();

    if (
        method.includes("upi")
    ) {
        return "UPI";
    }

    if (
        method.includes("card")
    ) {
        return "CARD";
    }

    if (
        method.includes("netbanking") ||
        method.includes("net_banking")
    ) {
        return "NETBANKING";
    }

    if (
        method.includes("wallet")
    ) {
        return "WALLET";
    }

    if (
        method.includes("emi")
    ) {
        return "EMI";
    }

    if (
        method.includes("paylater") ||
        method.includes("pay_later")
    ) {
        return "PAYLATER";
    }

    return null;
};


// ==========================================================
// Cashfree Status Mapper
// ==========================================================

const mapCashfreeStatus = (
    status
) => {

    const normalizedStatus =
        String(status || "")
            .toUpperCase();

    switch (normalizedStatus) {

        case "SUCCESS":
        case "PAID":
        case "CAPTURED":
            return "SUCCESS";

        case "FAILED":
        case "FAILURE":
            return "FAILED";

        case "AUTHORIZED":
            return "AUTHORIZED";

        case "CANCELLED":
        case "CANCELED":
            return "CANCELLED";

        case "PENDING":
        case "ACTIVE":
        case "USER_DROPPED":
            return "PENDING";

        case "CREATED":
            return "CREATED";

        default:
            return "PENDING";
    }
};


// ==========================================================
// Cashfree Webhook Parser
// ==========================================================

const parseCashfreeWebhook = (
    payload
) => {

    if (
        !payload ||
        typeof payload !== "object"
    ) {
        return null;
    }

    const data =
        payload.data || payload;

    const payment =
        data.payment || {};

    const order =
        data.order || {};

    const customer =
        data.customer_details || {};

    return {

        event:
            payload.type ||
            payload.event ||
            null,

        paymentId:
            payment.cf_payment_id ||
            payment.payment_id ||
            data.cf_payment_id ||
            null,

        orderId:
            order.order_id ||
            data.order_id ||
            null,

        amount:
            payment.payment_amount != null
                ? Number(payment.payment_amount)
                : order.order_amount != null
                    ? Number(order.order_amount)
                    : null,

        currency:
            payment.payment_currency ||
            order.order_currency ||
            "INR",

        status:
            payment.payment_status ||
            data.payment_status ||
            null,

        method:
            payment.payment_group ||
            payment.payment_method ||
            null,

        email:
            customer.customer_email ||
            null,

        contact:
            customer.customer_phone ||
            null,

        rawPayload:
            payload
    };
};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    verifyCashfreeWebhookSignature,

    mapCashfreePaymentMethod,

    mapCashfreeStatus,

    parseCashfreeWebhook

};