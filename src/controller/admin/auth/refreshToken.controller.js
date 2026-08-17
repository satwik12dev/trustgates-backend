const {
    refreshAdminTokenService
} = require(
    "../../../services/admin/refreshToken.service"
);


const refreshAdminTokenController = async (
    req,
    res,
    next
) => {

    try {

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
            await refreshAdminTokenService(
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
                "Admin token refreshed successfully.",

            accessToken:
                result.accessToken,

            refreshToken:
                result.refreshToken
        });

    } catch (error) {


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
            "Refresh token has expired."
        ) {

            return res.status(401).json({
                success: false,

                code:
                    "REFRESH_TOKEN_EXPIRED",

                message:
                    "Refresh token has expired. Please login again."
            });
        }


        if (
            error.message ===
            "Refresh token reuse detected. All admin sessions have been revoked."
        ) {

            return res.status(401).json({
                success: false,

                code:
                    "REFRESH_TOKEN_REUSE_DETECTED",

                message:
                    "Refresh token reuse detected. All admin sessions have been revoked. Please login again."
            });
        }


        if (
            error.message ===
            "Admin account not found."
        ) {

            return res.status(401).json({
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
            "Invalid admin session."
        ) {

            return res.status(401).json({
                success: false,

                code:
                    "ADMIN_SESSION_INVALID",

                message:
                    "Admin session is invalid. Please login again."
            });
        }


        if (
            error.message ===
            "Invalid refresh token family."
        ) {

            return res.status(401).json({
                success: false,

                code:
                    "INVALID_TOKEN_FAMILY",

                message:
                    "Invalid refresh token."
            });
        }


        if (
            error.message ===
            "Invalid admin token configuration."
        ) {

            return res.status(500).json({
                success: false,

                code:
                    "ADMIN_TOKEN_CONFIGURATION_ERROR",

                message:
                    "Admin authentication configuration is invalid."
            });
        }


        if (
            error.message ===
            "Failed to create new refresh token."
        ) {

            return res.status(500).json({
                success: false,

                code:
                    "REFRESH_TOKEN_CREATION_FAILED",

                message:
                    "Failed to create new admin session token."
            });
        }


        if (
            error.message ===
            "Failed to rotate refresh token."
        ) {

            return res.status(500).json({
                success: false,

                code:
                    "REFRESH_TOKEN_ROTATION_FAILED",

                message:
                    "Failed to rotate admin session token."
            });
        }


        next(error);
    }
};


module.exports =
    refreshAdminTokenController;