const Joi = require("joi");

const resetPasswordValidation =
    Joi.object({
        resetToken: Joi.string()
            .trim()
            .min(32)
            .max(4096)
            .required()
            .messages({
                "string.empty":
                    "Reset token is required.",

                "string.min":
                    "Invalid reset token.",

                "any.required":
                    "Reset token is required."
            }),

        newPassword: Joi.string()
            .min(8)
            .max(128)
            .required()
            .pattern(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/
            )
            .messages({
                "string.min":
                    "Password must be at least 8 characters long.",

                "string.max":
                    "Password must not exceed 128 characters.",

                "string.pattern.base":
                    "Password must contain uppercase, lowercase, number, and special character.",

                "any.required":
                    "New password is required."
            }),

        confirmPassword: Joi.any()
            .valid(
                Joi.ref("newPassword")
            )
            .required()
            .messages({
                "any.only":
                    "Passwords do not match.",

                "any.required":
                    "Confirm password is required."
            })
    });

module.exports =
    resetPasswordValidation;