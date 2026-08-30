const crypto = require("crypto");
const pool = require("../../config/pool");
const redis = require("../../config/redis");
const sendPasswordResetSuccessEmail = require("../../services/email/sendPasswordResetSuccessEmail");

const verifyPasswordReset = async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const { token, otp } = req.body;

        // ==========================
        // Validate Input
        // ==========================
        if (!token || !otp) {
            return res.status(400).json({
                success: false,
                message: "Token and OTP are required."
            });
        }

        // ==========================
        // Validate Reset Token
        // ==========================
        const session = await redis.get(
            `password-reset-token:${token}`
        );

        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link."
            });
        }

        const sessionData = JSON.parse(session);

const merchantId = sessionData.merchantId;
const email = sessionData.email;

if (!merchantId || !email) {
    return res.status(400).json({
        success: false,
        message: "Invalid reset session."
    });
}

        // ==========================
        // OTP Attempt Limit
        // ==========================
        const attemptsKey = `password-reset-attempts:${token}`;

        let attempts = Number(await redis.get(attemptsKey)) || 0;

        if (attempts >= 5) {
            return res.status(429).json({
                success: false,
                message: "Maximum OTP attempts exceeded."
            });
        }

        // ==========================
        // Get Stored OTP
        // ==========================
        const storedOtpHash = await redis.get(
            `password-reset-otp:${token}`
        );

        if (!storedOtpHash) {
            return res.status(400).json({
                success: false,
                message: "OTP expired."
            });
        }

        // ==========================
        // Hash Incoming OTP
        // ==========================
        const incomingHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        // ==========================
        // Compare OTP
        // ==========================
        const otpMatched = crypto.timingSafeEqual(
            Buffer.from(storedOtpHash),
            Buffer.from(incomingHash)
        );

        if (!otpMatched) {

            attempts++;

            await redis.set(
                attemptsKey,
                attempts,
                {
                    EX: 600
                }
            );

            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });
        }

        // ==========================
        // Get Password Hash
        // ==========================
        const hashedPassword = await redis.get(
            `password-reset-password:${token}`
        );

        if (!hashedPassword) {
            return res.status(400).json({
                success: false,
                message: "Password reset session expired."
            });
        }

        // ==========================
        // Update Password
        // ==========================
        await connection.beginTransaction();

        await connection.query(
            `
            UPDATE merchants
            SET password_hash = ?
            WHERE merchant_id = ?
            `,
            [
                hashedPassword,
                merchantId
            ]
        );

        await connection.commit();

        await redis.del(
            `password-reset-token:${token}`,
            `password-reset-password:${token}`,
            `password-reset-otp:${token}`,
            `password-reset-attempts:${token}`
        );

        // ==========================
        // Send Confirmation Email
        // ==========================
        if (email) {
            sendPasswordResetSuccessEmail(
                email,
                sessionData.merchantName || sessionData.merchant_name || ""
            ).catch((err) => {
                console.error("Failed to send password reset success email:", err);
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password reset successfully."
        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });

    } finally {

        connection.release();

    }

};

module.exports = verifyPasswordReset;