const jwt = require("jsonwebtoken");
const db = require("../config/pool");

const authenticateAdmin = async (
    req,
    res,
    next
) => {

    try {

        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                code: "ADMIN_AUTH_REQUIRED",
                message:
                    "Authorization token is required."
            });
        }

        const token =
            authHeader.substring(7).trim();

        if (
            !token ||
            token.length > 4096
        ) {
            return res.status(401).json({
                success: false,
                code: "ADMIN_INVALID_TOKEN",
                message:
                    "Invalid admin access token."
            });
        }

        let decoded;

        try {

            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET,
                {
                    algorithms: ["HS256"]
                }
            );

        } catch (error) {

            if (
                error.name ===
                "TokenExpiredError"
            ) {
                return res.status(401).json({
                    success: false,
                    code: "ADMIN_TOKEN_EXPIRED",
                    message:
                        "Admin access token has expired."
                });
            }

            return res.status(401).json({
                success: false,
                code: "ADMIN_INVALID_TOKEN",
                message:
                    "Invalid admin access token."
            });
        }

        if (
            !decoded ||
            decoded.type !== "ADMIN"
        ) {
            return res.status(403).json({
                success: false,
                code: "ADMIN_ACCESS_DENIED",
                message:
                    "Access denied."
            });
        }

        const adminId =
            Number(decoded.admin_id);

        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {
            return res.status(401).json({
                success: false,
                code: "ADMIN_INVALID_TOKEN",
                message:
                    "Invalid admin access token."
            });
        }

        if (
            typeof decoded.session_id !== "string" ||
            !decoded.session_id.trim()
        ) {
            return res.status(401).json({
                success: false,
                code: "ADMIN_SESSION_INVALID",
                message:
                    "Admin session information is missing."
            });
        }

        const tokenVersion =
            Number(decoded.token_version);

        if (
            !Number.isInteger(tokenVersion) ||
            tokenVersion < 0
        ) {
            return res.status(401).json({
                success: false,
                code: "ADMIN_INVALID_TOKEN",
                message:
                    "Invalid admin access token."
            });
        }

        const sessionId =
            decoded.session_id.trim();

        const [rows] =
            await db.query(
                `
                SELECT
                    a.admin_id,
                    a.full_name,
                    a.email,
                    a.role,
                    a.status,
                    a.token_version,
                    art.token_id,
                    art.session_id,
                    art.revoked,
                    art.expires_at
                FROM admins a
                LEFT JOIN admin_refresh_tokens art
                    ON art.admin_id = a.admin_id
                   AND art.session_id = ?
                   AND art.revoked = FALSE
                WHERE a.admin_id = ?
                LIMIT 1
                `,
                [
                    sessionId,
                    adminId
                ]
            );

        if (!rows.length) {
            return res.status(401).json({
                success: false,
                code: "ADMIN_NOT_FOUND",
                message:
                    "Admin account not found."
            });
        }

        const admin =
            rows[0];

        if (
            admin.status !== "ACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                code: "ADMIN_ACCOUNT_INACTIVE",
                message:
                    "Admin account is inactive."
            });
        }

        if (
            Number(admin.token_version) !==
            tokenVersion
        ) {
            return res.status(401).json({
                success: false,
                code: "ADMIN_SESSION_REVOKED",
                message:
                    "Session has been revoked. Please login again."
            });
        }

        if (
            !admin.token_id ||
            !admin.session_id
        ) {
            return res.status(401).json({
                success: false,
                code: "ADMIN_SESSION_REVOKED",
                message:
                    "Session has been revoked. Please login again."
            });
        }

        if (
            admin.expires_at &&
            new Date(
                admin.expires_at
            ).getTime() <= Date.now()
        ) {
            return res.status(401).json({
                success: false,
                code: "ADMIN_SESSION_EXPIRED",
                message:
                    "Admin session has expired. Please login again."
            });
        }

        req.admin = {
            admin_id:
                admin.admin_id,

            full_name:
                admin.full_name,

            email:
                admin.email,

            role:
                admin.role,

            status:
                admin.status,

            token_version:
                Number(admin.token_version),

            session_id:
                sessionId
        };

        req.adminToken = {
            sessionId,
            tokenVersion
        };

        next();

    } catch (error) {

        console.error(
            "ADMIN AUTH MIDDLEWARE ERROR:",
            error
        );

        next(error);
    }
};

module.exports =
    authenticateAdmin;