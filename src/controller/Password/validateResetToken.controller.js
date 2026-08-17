const redis = require("../../config/redis");

const validateResetToken = async (req, res) => {
    try {
        // ==========================
        // Get Reset Token
        // ==========================
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Reset token is required."
            });
        } 

        // ==========================
        // Check Token in Redis
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

if (
    !sessionData.merchantId ||
    !sessionData.email
) {
    return res.status(400).json({
        success: false,
        message: "Invalid reset session."
    });
}

        //==========================
        // Success
        // ==========================
        return res.status(200).json({
            success: true,
            message: "Reset link is valid."
        });

    } catch (error) {
        console.error("Validate Reset Token Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};

module.exports = validateResetToken;