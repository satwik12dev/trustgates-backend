const Joi = require("joi");

const verifyKycValidation = Joi.object({

    action: Joi.string()
        .valid("APPROVED", "REJECTED")
        .required()
        .messages({
            "any.only":
                "Action must be either APPROVED or REJECTED.",

            "any.required":
                "KYC action is required."
        }),

    verification_notes: Joi.string()
        .trim()
        .max(1000)
        .when("action", {
            is: "REJECTED",

            then:
                Joi.string()
                    .trim()
                    .min(1)
                    .max(1000)
                    .required(),

            otherwise:
                Joi.string()
                    .trim()
                    .max(1000)
                    .optional()
                    .allow("", null)
        })
        .messages({

            "any.required":
                "Verification notes are required when rejecting KYC.",

            "string.empty":
                "Verification notes cannot be empty when rejecting KYC.",

            "string.min":
                "Verification notes are required when rejecting KYC.",

            "string.max":
                "Verification notes cannot exceed 1000 characters."
        })
});


module.exports =
    verifyKycValidation;