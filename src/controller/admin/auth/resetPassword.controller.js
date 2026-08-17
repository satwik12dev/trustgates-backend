const resetPasswordValidation =
    require(
        "../../../validations/admin/resetPassword.validation"
    );

const {
    resetPasswordService
} = require(
    "../../../services/admin/password/resetPassword.service"
);


const resetPasswordController = async (
    req,
    res,
    next
) => {

    try {

        const {
            error,
            value
        } = resetPasswordValidation.validate(
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
                    "INVALID_RESET_PASSWORD_REQUEST",
                message:
                    error.details[0].message
            });
        }


        const result =
            await resetPasswordService(
                value.resetToken,
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
            "Invalid reset token."
        ) {

            return res.status(400).json({
                success: false,
                code:
                    "INVALID_RESET_TOKEN",
                message:
                    "Invalid reset token."
            });
        }


        if (
            error.message ===
            "Invalid or expired reset token."
        ) {

            return res.status(400).json({
                success: false,
                code:
                    "RESET_TOKEN_EXPIRED",
                message:
                    "Reset token is invalid or expired."
            });
        }


        if (
            error.message ===
            "Admin account not found."
        ) {

            return res.status(400).json({
                success: false,
                code:
                    "INVALID_RESET_TOKEN",
                message:
                    "Invalid reset token."
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
            "Failed to reset password."
        ) {

            return res.status(500).json({
                success: false,
                code:
                    "PASSWORD_RESET_FAILED",
                message:
                    "Failed to reset password."
            });
        }


        next(error);
    }
};


module.exports =
    resetPasswordController;