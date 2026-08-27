const extractRazorpayEvent = (
    payload,
    eventId
) => {

    if (
        !payload ||
        typeof payload !== "object"
    ) {
        throw new Error(
            "Invalid Razorpay webhook payload."
        );
    }

    if (
        !eventId ||
        typeof eventId !== "string"
    ) {
        throw new Error(
            "Razorpay webhook event ID is missing."
        );
    }

    const eventType =
        payload.event;

    if (
        !eventType ||
        typeof eventType !== "string"
    ) {
        throw new Error(
            "Razorpay webhook event type is missing."
        );
    }

    const payment =
        payload.payload?.payment?.entity || null;

    const refund =
        payload.payload?.refund?.entity || null;

    const order =
        payload.payload?.order?.entity || null;

    return {

        eventId,

        eventType,

        payment: payment
            ? {
                id:
                    payment.id || null,

                orderId:
                    payment.order_id || null,

                amount:
                    payment.amount ?? null,

                currency:
                    payment.currency || null,

                status:
                    payment.status || null,

                method:
                    payment.method || null,

                email:
                    payment.email || null,

                contact:
                    payment.contact || null
            }
            : null,

        refund: refund
            ? {
                id:
                    refund.id || null,

                paymentId:
                    refund.payment_id || null,

                amount:
                    refund.amount ?? null,

                currency:
                    refund.currency || null,

                status:
                    refund.status || null
            }
            : null,

        order: order
            ? {
                id:
                    order.id || null,

                amount:
                    order.amount ?? null,

                currency:
                    order.currency || null,

                status:
                    order.status || null
            }
            : null,

        payload

    };

};


module.exports = {
    extractRazorpayEvent
};