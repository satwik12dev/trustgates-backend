const Joi = require("joi");

// ==========================================================
// Generate API Credentials
// ==========================================================

const generateApiCredentialValidation = Joi.object({

    environment: Joi.string()
        .valid(
            "SANDBOX",
            "PRODUCTION"
        )
        .required()
        .messages({
            "any.required": "Environment is required.",
            "any.only": "Environment must be SANDBOX or PRODUCTION."
        }),

    webhookUrl: Joi.string()
        .uri()
        .allow("", null)
        .optional()
        .messages({
            "string.uri": "Webhook URL must be a valid URL."
        }),

    ipWhitelist: Joi.array()
        .items(
            Joi.string().ip()
        )
        .default([])
        .messages({
            "string.ip": "Each IP address must be valid."
        })

});

// ==========================================================
// Update Webhook URL
// ==========================================================

const updateWebhookValidation = Joi.object({

    webhookUrl: Joi.string()
        .uri()
        .required()
        .messages({
            "any.required": "Webhook URL is required.",
            "string.uri": "Webhook URL must be a valid URL."
        })

});

// ==========================================================
// Update API Credential Status
// ==========================================================

const updateApiStatusValidation = Joi.object({

    status: Joi.string()
        .valid(
            "ACTIVE",
            "INACTIVE",
            "REVOKED"
        )
        .required()
        .messages({
            "any.required": "Status is required.",
            "any.only": "Status must be ACTIVE, INACTIVE or REVOKED."
        })

});

// ==========================================================
// Regenerate API Credentials
// ==========================================================

const regenerateApiCredentialValidation = Joi.object({});

// ==========================================================
// Exports
// ==========================================================

module.exports = {

    generateApiCredentialValidation,

    updateWebhookValidation,

    updateApiStatusValidation,

    regenerateApiCredentialValidation

};