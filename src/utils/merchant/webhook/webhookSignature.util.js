// ==========================================================
// Webhook Signature Generator Utility
// ==========================================================


const crypto = require("crypto");



// ==========================================================
// Generate Webhook Signature
// ==========================================================

const generateWebhookSignature = (
    payload,
    secret
) => {

    if(!payload || !secret){
        throw new Error(
            "Payload and secret are required to generate signature."
        );

    }

    const payloadString = JSON.stringify(payload);

    const signature = crypto.createHmac("sha256",secret)
                        .update(payloadString)
                        .digest("hex");
    return signature;
};


const verifyWebhookSignature = (
    payload,
    signature,
    secret
) => {

    const generatedSignature = generateWebhookSignature(
        payload,
        secret
    );

    return crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(signature)
    );
};

module.exports = {
    generateWebhookSignature,
    verifyWebhookSignature
};