const loginValidation =
    require(
        "../../../validations/admin/login.validation"
    );

const {
    loginService
} = require(
    "../../../services/admin/login.service"
);

const adminlogin = async (
    req,
    res,
    next
) => {

    try {

        const {
            error,
            value
        } = loginValidation.validate(
            req.body,
            {
                abortEarly: true,
                stripUnknown: true
            }
        );

        if (error) {

            return res.status(400).json({
                success: false,
                message:
                    error.details[0].message
            });
        }

        const {
            email,
            password
        } = value;

        const result =
            await loginService(
                email,
                password,
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
                "Login successful.",

            accessToken:
                result.accessToken,

            refreshToken:
                result.refreshToken,

            admin:
                result.admin
        });

    } catch (error) {

        if (
            error.message ===
            "Invalid email or password."
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });
        }

        if (
            error.message ===
            "Your account is inactive."
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Your account is inactive."
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
            "Failed to create admin session."
        ) {

            return res.status(500).json({
                success: false,
                code:
                    "ADMIN_SESSION_CREATION_FAILED",
                message:
                    "Failed to create admin session."
            });
        }

        next(error);
    }
};

module.exports = adminlogin;