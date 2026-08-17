const Joi = require("joi");

const verifyForgotPasswordOtpValidation =
    Joi.object({
        email: Joi.string()
            .trim()
            .lowercase()
            .email()
            .max(255)
            .required(),

        otp: Joi.string()
            .trim()
            .pattern(/^[0-9]{6}$/)
            .required()
            .messages({
                "string.pattern.base":
                    "OTP must be exactly 6 digits.",

                "string.empty":
                    "OTP is required.",

                "any.required":
                    "OTP is required."
            })
    });

module.exports =
    verifyForgotPasswordOtpValidation;