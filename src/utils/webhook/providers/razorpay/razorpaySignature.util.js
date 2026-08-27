const crypto = require("crypto");

const verifyRazorpaySignature = (
    rawBody,
    signature,
    webhookSecret
) => {

    if (!rawBody) {
        throw new Error(
            "Webhook raw body is required."
        );
    }

    if (!signature) {
        throw new Error(
            "Razorpay webhook signature is required."
        );
    }

    if (!webhookSecret) {
        throw new Error(
            "Razorpay webhook secret is required."
        );
    }

    const expectedSignature =
        crypto
            .createHmac(
                "sha256",
                webhookSecret
            )
            .update(rawBody)
            .digest("hex");

    const expectedBuffer =
        Buffer.from(
            expectedSignature,
            "utf8"
        );

    const receivedBuffer =
        Buffer.from(
            signature,
            "utf8"
        );

    if (
        expectedBuffer.length !==
        receivedBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
    );
};

module.exports = {
    verifyRazorpaySignature
};