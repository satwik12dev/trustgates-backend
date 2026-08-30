const bcrypt = require("bcrypt");
const crypto = require("crypto");

const redis = require("../../config/redis");
const sendPasswordResetOtpEmail = require("../../services/email/sendPasswordResetOtpEmail");

const requestPasswordChange = async (req, res) => {
    try {

        const {
            token,
            newPassword,
            confirmPassword
        } = req.body;

        // ==========================
        // Validate Input
        // ==========================
        if (
            !token ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // ==========================
        // Password Match
        // ==========================
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
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
        // Hash Password
        // ==========================
        const hashedPassword =
            await bcrypt.hash(newPassword, 12);

        // ==========================
        // Store Password Temporarily
        // ==========================
        await redis.set(
            `password-reset-password:${token}`,
            hashedPassword,
            {
                EX: 600
            }
        );

        // ==========================
        // Generate OTP
        // ==========================
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // ==========================
        // Hash OTP
        // ==========================
        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        // ==========================
        // Store OTP
        // ==========================
        await redis.set(
            `password-reset-otp:${token}`,
            otpHash,
            {
                EX: 600
            }
        );

        // Clear old attempts
        await redis.del(
            `password-reset-attempts:${token}`
        );

        // ==========================
        // Send OTP Email
        // ==========================
        await sendPasswordResetOtpEmail(
            email,
            otp,
            sessionData.merchantName || sessionData.merchant_name || ""
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });

    }
};

module.exports = requestPasswordChange;