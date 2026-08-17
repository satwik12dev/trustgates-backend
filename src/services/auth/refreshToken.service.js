const db = require("../../config/pool");
const {
    generateRefreshToken,
    hashRefreshToken
} = require("../../utils/refreshToken.util");

/**
 * Create and store a new refresh token for merchant
 */
const createRefreshToken = async ({
    merchantId,
    userAgent = null,
    ipAddress = null
}) => {

    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    const [result] = await db.query(
        `INSERT INTO refresh_tokens
        (
            merchant_id,
            token_hash,
            expires_at,
            user_agent,
            ip_address
        )
        VALUES
        (
            ?,
            ?,
            DATE_ADD(NOW(), INTERVAL 7 DAY),
            ?,
            ?
        )`,
        [
            merchantId,
            tokenHash,
            userAgent,
            ipAddress
        ]
    );

    return {
        tokenId: result.insertId,
        refreshToken
    };
};


/**
 * Find refresh token by its hash
 */
const findRefreshToken = async (refreshToken) => {

    const tokenHash = hashRefreshToken(refreshToken);

    const [rows] = await db.query(
        `SELECT
            token_id,
            merchant_id,
            token_hash,
            expires_at,
            revoked,
            revoked_at,
            replaced_by_token_id,
            last_used_at,
            user_agent,
            ip_address,
            created_at
         FROM refresh_tokens
         WHERE token_hash = ?
         LIMIT 1`,
        [tokenHash]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
};


/**
 * Revoke a refresh token
 */
const revokeRefreshToken = async (tokenId, replacedByTokenId = null) => {

    await db.query(
        `UPDATE refresh_tokens
         SET
            revoked = 1,
            revoked_at = NOW(),
            replaced_by_token_id = ?,
            last_used_at = NOW()
         WHERE token_id = ?
           AND revoked = 0`,
        [
            replacedByTokenId,
            tokenId
        ]
    );
};


/**
 * Update last used time
 */
const updateLastUsed = async (tokenId) => {

    await db.query(
        `UPDATE refresh_tokens
         SET last_used_at = NOW()
         WHERE token_id = ?`,
        [tokenId]
    );
};


/**
 * Revoke all active refresh tokens of a merchant
 */
const revokeAllMerchantTokens = async (merchantId) => {

    await db.query(
        `UPDATE refresh_tokens
         SET
            revoked = 1,
            revoked_at = NOW()
         WHERE merchant_id = ?
           AND revoked = 0`,
        [merchantId]
    );
};


module.exports = {
    createRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
    updateLastUsed,
    revokeAllMerchantTokens
};