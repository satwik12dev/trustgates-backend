const {
    logoutService,
    logoutAllAdminSessions
} = require(
    "../../../services/admin/logout.service"
);


const adminlogout = async (
    req,
    res,
    next
) => {

    try {

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {
            return res.status(401).json({
                success: false,
                code:
                    "ADMIN_AUTH_REQUIRED",
                message:
                    "Admin authentication is required."
            });
        }


        const {
            refreshToken
        } = req.body || {};


        if (
            typeof refreshToken !== "string" ||
            !refreshToken.trim()
        ) {
            return res.status(400).json({
                success: false,
                code:
                    "REFRESH_TOKEN_REQUIRED",
                message:
                    "Refresh token is required."
            });
        }


        if (
            refreshToken.length > 4096
        ) {
            return res.status(400).json({
                success: false,
                code:
                    "INVALID_REFRESH_TOKEN",
                message:
                    "Invalid refresh token."
            });
        }


        const result =
            await logoutService(
                req.admin.admin_id,
                refreshToken.trim(),
                {
                    ipAddress:
                        req.audit?.ipAddress,

                    userAgent:
                        req.audit?.userAgent,

                    requestId:
                        req.audit?.requestId
                }
            );


        return res.status(200).json({
            success: true,
            message:
                result.message
        });

    } catch (error) {

        if (
            error.message ===
            "Invalid refresh token."
        ) {
            return res.status(401).json({
                success: false,
                code:
                    "INVALID_REFRESH_TOKEN",
                message:
                    "Invalid refresh token."
            });
        }


        if (
            error.message ===
            "Invalid or expired refresh token."
        ) {
            return res.status(401).json({
                success: false,
                code:
                    "INVALID_REFRESH_TOKEN",
                message:
                    "Invalid or expired refresh token."
            });
        }


        if (
            error.message ===
            "Invalid admin."
        ) {
            return res.status(401).json({
                success: false,
                code:
                    "INVALID_ADMIN_CONTEXT",
                message:
                    "Invalid admin authentication context."
            });
        }


        if (
            error.message ===
            "Admin account not found."
        ) {
            return res.status(404).json({
                success: false,
                code:
                    "ADMIN_NOT_FOUND",
                message:
                    "Admin account not found."
            });
        }


        if (
            error.message ===
            "Admin account is inactive."
        ) {
            return res.status(403).json({
                success: false,
                code:
                    "ADMIN_ACCOUNT_INACTIVE",
                message:
                    "Admin account is inactive."
            });
        }


        if (
            error.message ===
            "Failed to logout admin session."
        ) {
            return res.status(500).json({
                success: false,
                code:
                    "ADMIN_LOGOUT_FAILED",
                message:
                    "Failed to logout admin session."
            });
        }


        if (
            error.message ===
            "Failed to revoke admin session."
        ) {
            return res.status(500).json({
                success: false,
                code:
                    "ADMIN_SESSION_REVOCATION_FAILED",
                message:
                    "Failed to revoke admin session."
            });
        }


        next(error);
    }
};


const logoutAllController = async (
    req,
    res,
    next
) => {

    try {

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {
            return res.status(401).json({
                success: false,
                code:
                    "ADMIN_AUTH_REQUIRED",
                message:
                    "Admin authentication is required."
            });
        }


        const result =
            await logoutAllAdminSessions(
                req.admin.admin_id,
                {
                    ipAddress:
                        req.audit?.ipAddress,

                    userAgent:
                        req.audit?.userAgent,

                    requestId:
                        req.audit?.requestId
                }
            );


        return res.status(200).json({
            success: true,

            message:
                result.message,

            revokedSessions:
                result.revokedSessions
        });

    } catch (error) {

        if (
            error.message ===
            "Invalid admin."
        ) {
            return res.status(401).json({
                success: false,
                code:
                    "INVALID_ADMIN_CONTEXT",
                message:
                    "Invalid admin authentication context."
            });
        }


        if (
            error.message ===
            "Admin account not found."
        ) {
            return res.status(404).json({
                success: false,
                code:
                    "ADMIN_NOT_FOUND",
                message:
                    "Admin account not found."
            });
        }


        if (
            error.message ===
            "Admin account is inactive."
        ) {
            return res.status(403).json({
                success: false,
                code:
                    "ADMIN_ACCOUNT_INACTIVE",
                message:
                    "Admin account is inactive."
            });
        }


        if (
            error.message ===
            "Failed to revoke admin sessions."
        ) {
            return res.status(500).json({
                success: false,
                code:
                    "ADMIN_LOGOUT_ALL_FAILED",
                message:
                    "Failed to revoke admin sessions."
            });
        }


        next(error);
    }
};


module.exports = {
    adminlogout,
    logoutAllController
};