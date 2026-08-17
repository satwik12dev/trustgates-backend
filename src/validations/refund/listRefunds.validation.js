const Joi = require("joi");

// ==========================================================
// List Refunds Validation
// ==========================================================

const listRefundsValidation = Joi.object({

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    refundStatus: Joi.string()
        .valid(
            "CREATED",
            "PROCESSING",
            "PROCESSED",
            "FAILED"
        )
        .optional(),

    refundType: Joi.string()
        .valid(
            "FULL",
            "PARTIAL"
        )
        .optional(),

    fromDate: Joi.date()
        .optional(),

    toDate: Joi.date()
        .min(Joi.ref("fromDate"))
        .optional(),

    sortBy: Joi.string()
        .valid(
            "created_at",
            "amount",
            "processed_at"
        )
        .default("created_at"),

    sortOrder: Joi.string()
        .valid(
            "ASC",
            "DESC"
        )
        .default("DESC")

});

// ==========================================================
// Export
// ==========================================================

module.exports = {

    listRefundsValidation

};