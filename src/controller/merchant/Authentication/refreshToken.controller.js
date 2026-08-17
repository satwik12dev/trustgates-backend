const {
    findRefreshToken,
    createRefreshToken,
    revokeRefreshToken,
    revokeAllMerchantTokens
} = require("../../../services/auth/refreshToken.service");

const db = require("../../../config/pool");
const generateToken = require("../../../utils/jwt.util");


const refreshToken = async (req, res) => {

    try {

        // --------------------------------------------------
        // 1. Get refresh token from request
        // --------------------------------------------------

        const { refreshToken: incomingToken } = req.body;

        if (!incomingToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required."
            });
        }


        // --------------------------------------------------
        // 2. Find refresh token in database
        // --------------------------------------------------

        const storedToken = await findRefreshToken(
            incomingToken
        );

        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token."
            });
        }


        // --------------------------------------------------
        // 3. Check refresh token expiry
        // --------------------------------------------------

        if (
            !storedToken.expires_at ||
            new Date(storedToken.expires_at) <= new Date()
        ) {

            await revokeRefreshToken(
                storedToken.token_id
            );

            return res.status(401).json({
                success: false,
                message: "Refresh token expired. Please login again."
            });
        }


        // --------------------------------------------------
        // 4. Refresh token reuse detection
        // --------------------------------------------------

        if (storedToken.revoked) {

            /*
             * A revoked refresh token is being used again.
             * This can indicate token theft/reuse.
             *
             * Revoke all active refresh tokens of this
             * merchant so the attacker cannot continue
             * using the token family.
             */

            await revokeAllMerchantTokens(
                storedToken.merchant_id
            );

            return res.status(401).json({
                success: false,
                message: "Refresh token reuse detected. Please login again."
            });
        }


        // --------------------------------------------------
        // 5. Get merchant
        // --------------------------------------------------

        const [rows] = await db.query(
            `SELECT
                merchant_id,
                merchant_name,
                email,
                account_status,
                email_verified
             FROM merchants
             WHERE merchant_id = ?
             LIMIT 1`,
            [
                storedToken.merchant_id
            ]
        );


        if (rows.length === 0) {

            await revokeRefreshToken(
                storedToken.token_id
            );

            return res.status(401).json({
                success: false,
                message: "Merchant account not found."
            });
        }


        const merchant = rows[0];


        // --------------------------------------------------
        // 6. Check email verification
        // --------------------------------------------------

        if (!merchant.email_verified) {

            await revokeRefreshToken(
                storedToken.token_id
            );

            return res.status(403).json({
                success: false,
                message: "Please verify your email first."
            });
        }


        // --------------------------------------------------
        // 7. Check merchant account status
        // --------------------------------------------------

        if (merchant.account_status !== "ACTIVE") {

            await revokeRefreshToken(
                storedToken.token_id
            );

            return res.status(403).json({
                success: false,
                message: "Your account is not active."
            });
        }


        // --------------------------------------------------
        // 8. Generate new access token
        // --------------------------------------------------

        const accessToken = generateToken(
            merchant.merchant_id,
            merchant.email
        );


        // --------------------------------------------------
        // 9. Generate new refresh token
        // --------------------------------------------------

        const newRefreshTokenData = await createRefreshToken({
            merchantId: merchant.merchant_id,
            userAgent: req.headers["user-agent"] || null,
            ipAddress: req.ip || null
        });


        // --------------------------------------------------
        // 10. Revoke old refresh token
        // --------------------------------------------------

        await revokeRefreshToken(
            storedToken.token_id,
            newRefreshTokenData.tokenId
        );


        // --------------------------------------------------
        // 11. Return new tokens
        // --------------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully.",
            accessToken: accessToken,
            refreshToken: newRefreshTokenData.refreshToken
        });


    } catch (error) {

        console.error(
            "Refresh Token Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};


module.exports = refreshToken;