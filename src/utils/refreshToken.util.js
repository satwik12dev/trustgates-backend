const crypto = require("crypto");

/**
 * Generate a cryptographically secure refresh token.
 */
const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex");
};

/**
 * Create SHA-256 hash of refresh token
 * for secure database storage.
 */
const hashRefreshToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

module.exports = {
    generateRefreshToken,
    hashRefreshToken
};