const Joi = require("joi");

const changePasswordValidation = Joi.object({

    currentPassword: Joi.string()
        .min(8)
        .max(128)
        .required(),

    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/[a-z]/)
        .pattern(/[A-Z]/)
        .pattern(/[0-9]/)
        .pattern(/[^A-Za-z0-9]/)
        .required()
        .invalid(Joi.ref("currentPassword"))
        .messages({
            "string.min":
                "New password must be at least 12 characters long.",

            "string.max":
                "New password cannot exceed 128 characters.",

            "string.pattern.base":
                "New password must contain uppercase, lowercase, number and special character.",

            "any.invalid":
                "New password must be different from the current password."
        }),

    confirmPassword: Joi.any()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "any.only":
                "Passwords do not match."
        })

}).required();

module.exports = changePasswordValidation;