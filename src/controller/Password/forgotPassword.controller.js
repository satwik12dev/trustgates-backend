const pool = require("../../config/pool");
const redis = require("../../config/redis");
const sendEmail2 = require("../../services/pass.service");
const generateResetToken = require("../../utils/generateResetToken");

const forgotPassword = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const [merchant] = await connection.query(
            `
            SELECT merchant_id,
                   email,
                   status,
                   email_verified
            FROM merchants
            WHERE email = ?
            LIMIT 1
            `,
            [email]
        );

        // Don't reveal whether email exists
        if (merchant.length === 0) {
            return res.status(200).json({
                success: true,
                message:
                    "If an account exists, a password reset link has been sent."
            });
        }

        const user = merchant[0];

        // ==========================
        // Email Verification Check
        // ==========================
        if (!user.email_verified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first."
            });
        }

        // ==========================
        // Account Status
        // ==========================
        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Account is not active."
            });
        }

        // ==========================
        // Resend Cooldown
        // ==========================
        const cooldownKey = `password-reset-resend:${user.merchant_id}`;

        const cooldown = await redis.get(cooldownKey);

        if (cooldown) {

            const ttl = await redis.ttl(cooldownKey);

            return res.status(429).json({
                success: false,
                message: `Please wait ${ttl} seconds before requesting another password reset link.`
            });
        }

        // ==========================
// Generate Reset Token
// ==========================
const resetToken = generateResetToken();

// ==========================
// Store Reset Session
// ==========================
await redis.set(
    `password-reset-token:${resetToken}`,
    JSON.stringify({
        merchantId: user.merchant_id,
        email: user.email
    }),
    {
        EX: 600
    }
);

        // ==========================
        // Cooldown
        // ==========================
        await redis.set(cooldownKey, "1", {
            EX: 60
        });

        // ==========================
        // Reset Link
        // ==========================
        const resetLink =
            `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // ==========================
        // Send Email
        // ==========================
        await sendEmail2({
            to: user.email,
            subject: "Reset Your Password",
            html: `
                <h2>Password Reset</h2>

                <p>We received a request to reset your password.</p>

                <p>
                    <a href="${resetLink}">
                        Reset Password
                    </a>
                </p>

                <p>This link expires in 10 minutes.</p>

                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your email."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });

    } finally {
        connection.release();
    }
};

module.exports = forgotPassword;