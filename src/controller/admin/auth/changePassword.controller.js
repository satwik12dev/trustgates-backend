const changePasswordValidation =
    require(
        "../../../validations/admin/changePassword.validation"
    );

const {
    changePasswordService
} = require(
    "../../../services/admin/changePassword.service"
);


const changePasswordController = async (
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
            error,
            value
        } = changePasswordValidation.validate(
            req.body,
            {
                abortEarly: true,
                stripUnknown: true
            }
        );


        if (error) {

            return res.status(400).json({
                success: false,
                code:
                    "INVALID_PASSWORD_REQUEST",
                message:
                    error.details[0].message
            });

        }


        const result =
            await changePasswordService(
                req.admin.admin_id,

                value.currentPassword,

                value.newPassword,

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
                    "ADMIN_INACTIVE",
                message:
                    "Admin account is inactive."
            });
        }


        if (
            error.message ===
            "Current password is incorrect."
        ) {
            return res.status(401).json({
                success: false,
                code:
                    "CURRENT_PASSWORD_INVALID",
                message:
                    "Current password is incorrect."
            });
        }


        if (
            error.message ===
            "New password must be different from the current password."
        ) {
            return res.status(400).json({
                success: false,
                code:
                    "PASSWORD_REUSE_NOT_ALLOWED",
                message:
                    error.message
            });
        }


        if (
            error.message ===
            "Failed to change password."
        ) {
            return res.status(500).json({
                success: false,
                code:
                    "PASSWORD_CHANGE_FAILED",
                message:
                    "Failed to change password."
            });
        }


        next(error);
    }
};


module.exports =
    changePasswordController;