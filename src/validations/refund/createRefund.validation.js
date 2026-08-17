const Joi = require("joi");

// ==========================================================
// Create Refund Validation
// ==========================================================

const createRefundValidation = Joi.object({

    transactionReference: Joi.string()

        .trim()

        .required()

        .messages({

            "string.base": "Transaction reference must be a string.",

            "string.empty": "Transaction reference is required.",

            "any.required": "Transaction reference is required."

        }),

    amount: Joi.number()

        .positive()

        .precision(2)

        .required()

        .messages({

            "number.base": "Refund amount must be a number.",

            "number.positive": "Refund amount must be greater than zero.",

            "any.required": "Refund amount is required."

        }),

    reason: Joi.string()

        .trim()

        .max(255)

        .required()

        .messages({

            "string.base": "Refund reason must be a string.",

            "string.empty": "Refund reason is required.",

            "string.max": "Refund reason cannot exceed 255 characters.",

            "any.required": "Refund reason is required."

        })

});

// ==========================================================
// Export
// ==========================================================

module.exports = {

    createRefundValidation

};