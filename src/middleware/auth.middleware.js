const jwt = require("jsonwebtoken");
const pool = require("../config/pool");

const authenticate = async (req, res, next) => {
    try {
        // ==========================================
        // Get Authorization Header
        // ==========================================
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please login."
            });
        }
        // ==========================================
        // Extract Token
        // ==========================================
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing."
            });
        }
        // ==========================================
        // Verify JWT
        // ==========================================
        let decoded;
        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Session expired. Please login again."
                });
            }
            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid authentication token."
                });
            }
            return res.status(401).json({
                success: false,
                message: "Authentication failed."
            });
        }
        const merchantId = decoded.merchant_id;
        const [merchantRows] = await pool.query(
            `SELECT
        merchant_id,
        merchant_name,
        email,
        email_verified,
        two_factor_enabled,
        account_status,
        created_at
    FROM merchants
    WHERE merchant_id = ?
    LIMIT 1
    `,
            [merchantId]
        );
        if (merchantRows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "You are not Authrorize for thi page"
            });
        }
        const merchant = merchantRows[0];
        // ==========================================
        // Account Status Check
        // ==========================================
        if (merchant.account_status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Merchant account is inactive."
            });
        }
        // ==========================================
        // Email Verification Check
        // ==========================================
        if (!merchant.email_verified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before continuing."
            });
        }
        // ==========================================
        // Attach Merchant to Request
        // ==========================================
        req.user = {
            merchant_id: merchant.merchant_id,
            merchant_name: merchant.merchant_name,
            email: merchant.email,
            email_verified: merchant.email_verified,
            two_factor_enabled: merchant.two_factor_enabled,
            account_status: merchant.account_status
        };
        req.token = token;
        next();
    } catch (error) {
        console.error("Authentication Middleware Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });

    }
};

module.exports = authenticate;