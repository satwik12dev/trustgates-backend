// src/validations/dashboard/settlementSummary.validation.js

const Joi = require("joi");

const settlementSummarySchema = Joi.object({

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    settlement_status: Joi.string()
        .valid(
            "ALL",
            "PENDING",
            "PROCESSING",
            "SETTLED",
            "FAILED"
        )
        .default("ALL"),

    start_date: Joi.date()
        .iso()
        .optional(),

    end_date: Joi.date()
        .iso()
        .min(Joi.ref("start_date"))
        .optional(),

    sort_by: Joi.string()
        .valid(
            "settlement_date",
            "net_amount",
            "created_at"
        )
        .default("settlement_date"),

    sort_order: Joi.string()
        .valid(
            "ASC",
            "DESC"
        )
        .default("DESC")

});

const validateSettlementSummary = (query) => {

    return settlementSummarySchema.validate(query, {
        abortEarly: false,
        stripUnknown: true
    });

};

module.exports = {
    validateSettlementSummary
};