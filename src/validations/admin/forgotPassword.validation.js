const Joi = require("joi");

const forgotPasswordValidation = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(255)
        .required()
        .messages({
            "string.empty":
                "Email is required.",

            "string.email":
                "Please enter a valid email address.",

            "string.max":
                "Email must not exceed 255 characters.",

            "any.required":
                "Email is required."
        })
});

module.exports =
    forgotPasswordValidation;