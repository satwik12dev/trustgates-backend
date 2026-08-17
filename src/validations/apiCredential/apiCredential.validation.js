const Joi = require("joi");

// ==========================================================
// Update Webhook URL
// ==========================================================

const updateWebhookValidation = Joi.object({

    webhookUrl: Joi.string()
        .uri()
        .required()
        .messages({

            "string.base": "Webhook URL must be a string.",

            "string.empty": "Webhook URL is required.",

            "string.uri": "Webhook URL must be a valid URL.",

            "any.required": "Webhook URL is required."

        })

});

// ==========================================================
// Update API Status
// ==========================================================

const updateApiStatusValidation = Joi.object({

    status: Joi.string()
        .valid("ACTIVE", "INACTIVE")
        .required()
        .messages({

            "any.only": "Status must be either ACTIVE or INACTIVE.",

            "any.required": "Status is required."

        })

});

// ==========================================================
// Regenerate API Credentials
// ==========================================================

const regenerateApiCredentialValidation = Joi.object({

    confirm: Joi.boolean()
        .valid(true)
        .required()
        .messages({

            "any.only": "Confirmation is required to regenerate API credentials.",

            "any.required": "Confirmation is required."

        })

});

// ==========================================================
// Exports
// ==========================================================

module.exports = {

    updateWebhookValidation,

    updateApiStatusValidation,

    regenerateApiCredentialValidation

};