const Joi = require("joi");

// ==========================================================
// ADMIN DASHBOARD VALIDATION
// ==========================================================

const dashboardValidation = Joi.object({

    // ======================================================
    // PAYIN / PAYOUT
    // ======================================================

    paymentType: Joi.string()
        .valid("PAYIN", "PAYOUT")
        .required()
        .messages({
            "any.required":
                "Payment type is required.",

            "any.only":
                "Payment type must be either PAYIN or PAYOUT."
        }),


    // ======================================================
    // MERCHANT ID
    // ======================================================

    merchantId: Joi.number()
        .integer()
        .positive()
        .allow(null, "")
        .default(null)
        .messages({
            "number.base":
                "Merchant ID must be a valid number.",

            "number.integer":
                "Merchant ID must be an integer.",

            "number.positive":
                "Merchant ID must be a positive number."
        }),


    // ======================================================
    // SINGLE DATE
    // ======================================================

    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow(null, "")
        .default(null)
        .messages({
            "string.pattern.base":
                "Date must be in YYYY-MM-DD format."
        }),


    // ======================================================
    // START DATE
    // ======================================================

    startDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow(null, "")
        .default(null)
        .messages({
            "string.pattern.base":
                "Start date must be in YYYY-MM-DD format."
        }),


    // ======================================================
    // END DATE
    // ======================================================

    endDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow(null, "")
        .default(null)
        .messages({
            "string.pattern.base":
                "End date must be in YYYY-MM-DD format."
        }),


    // ======================================================
    // TOP MERCHANT LIMIT
    // ======================================================

    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(10)
        .messages({
            "number.base":
                "Limit must be a number.",

            "number.integer":
                "Limit must be an integer.",

            "number.min":
                "Limit must be at least 1.",

            "number.max":
                "Limit cannot be greater than 50."
        })

});


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {
    dashboardValidation
};