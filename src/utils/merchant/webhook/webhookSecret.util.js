const crypto = require("crypto");

const generateWebhookSecret = () => {
    const randomSecret = crypto
        .randomBytes(32)
        .toString("hex");

    return `whsec_${randomSecret}`;
};

module.exports = generateWebhookSecret;