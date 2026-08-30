const loginValidation =
    require(
        "../../../validations/admin/login.validation"
    );

const {
    loginService
} = require(
    "../../../services/admin/login.service"
);

const sendNewLoginAlertEmail = require(
    "../../../services/email/sendNewLoginAlertEmail"
);


const adminlogin = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Request
        // ==================================================

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


        // ==================================================
        // Credentials
        // ==================================================

        const {
            email,
            password
        } = value;


        // ==================================================
        // Login Service
        // ==================================================

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


        // ==================================================
        // Send Login Alert Email
        // ==================================================

        if (result.admin && result.admin.email) {
            sendNewLoginAlertEmail(
                result.admin.full_name || "Admin",
                result.admin.email,
                {
                    ip: req.audit?.ipAddress || req.ip || req.headers["x-forwarded-for"] || "N/A",
                    userAgent: req.audit?.userAgent || req.headers["user-agent"] || "Unknown Device",
                    time: new Date().toUTCString()
                }
            ).catch((err) => {
                console.error("Failed to send admin login alert email:", err.message);
            });
        }


        // ==================================================
        // Success
        // ==================================================

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

        // ==================================================
        // Invalid Credentials
        // ==================================================

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


        // ==================================================
        // Inactive Account
        // ==================================================

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


        // ==================================================
        // Token Configuration Error
        // ==================================================

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


        // ==================================================
        // Admin Not Found
        // ==================================================

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


        // ==================================================
        // Session Creation Failed
        // ==================================================

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


        // ==================================================
        // Unknown Error
        // ==================================================

        next(error);

    }

};


module.exports =
    adminlogin;