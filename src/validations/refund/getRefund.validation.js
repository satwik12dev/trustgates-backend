const Joi = require("joi");

// ==========================================================
// Get Refund By Refund ID
// ==========================================================

const getRefundByIdValidation = Joi.object({

    refundId: Joi.number()

        .integer()

        .positive()

        .required()

        .messages({

            "number.base": "Refund ID must be a number.",

            "number.integer": "Refund ID must be an integer.",

            "number.positive": "Refund ID must be greater than zero.",

            "any.required": "Refund ID is required."

        })

});

// ==========================================================
// Get Refund By Refund Reference
// ==========================================================

const getRefundByReferenceValidation = Joi.object({

    refundReference: Joi.string()

        .trim()

        .required()

        .messages({

            "string.base": "Refund reference must be a string.",

            "string.empty": "Refund reference is required.",

            "any.required": "Refund reference is required."

        })

});

// ==========================================================
// Get Refund By Gateway Refund ID
// ==========================================================

const getRefundByGatewayIdValidation = Joi.object({

    gatewayRefundId: Joi.string()

        .trim()

        .required()

        .messages({

            "string.base": "Gateway refund ID must be a string.",

            "string.empty": "Gateway refund ID is required.",

            "any.required": "Gateway refund ID is required."

        })

});

// ==========================================================
// Export
// ==========================================================

module.exports = {

    getRefundByIdValidation,

    getRefundByReferenceValidation,

    getRefundByGatewayIdValidation

};