// src/validations/dashboard/refundSummary.validation.js

const Joi = require("joi");

const refundSummarySchema = Joi.object({

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    search: Joi.string()
        .trim()
        .allow("")
        .optional(),

    refund_status: Joi.string()
        .valid(
            "ALL",
            "PENDING",
            "PROCESSING",
            "SUCCESS",
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
            "refund_amount",
            "refunded_at",
            "created_at"
        )
        .default("refunded_at"),

    sort_order: Joi.string()
        .valid(
            "ASC",
            "DESC"
        )
        .default("DESC")

});

const validateRefundSummary = (query) => {

    return refundSummarySchema.validate(query, {

        abortEarly: false,
        stripUnknown: true

    });

};

module.exports = {
    validateRefundSummary
};