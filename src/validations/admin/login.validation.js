const Joi = require("joi");

const loginValidation = Joi.object({
    email: Joi.string()
        .trim()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Please enter a valid email address.",
            "any.required": "Email is required."
        }),

    password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .messages({
            "string.empty": "Password is required.",
            "string.min": "Password must be at least 8 characters long.",
            "string.max": "Password cannot exceed 128 characters.",
            "any.required": "Password is required."
        })
});

module.exports = loginValidation;