// src/validations/dashboard/recentTransactions.validation.js

const Joi = require("joi");

const recentTransactionsSchema = Joi.object({

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

    status: Joi.string()
        .valid(
            "ALL",
            "SUCCESS",
            "FAILED",
            "PENDING",
            "CHARGEBACK",
            "REFUNDED"
        )
        .default("ALL"),

    payment_method: Joi.string()
        .valid(
            "ALL",
            "UPI",
            "CARD",
            "NETBANKING",
            "WALLET",
            "EMI",
            "PAYLATER"
        )
        .default("ALL"),

    sort_by: Joi.string()
        .valid(
            "created_at",
            "amount",
            "customer_name"
        )
        .default("created_at"),

    sort_order: Joi.string()
        .valid(
            "ASC",
            "DESC"
        )
        .default("DESC"),

    start_date: Joi.date()
        .iso()
        .optional(),

    end_date: Joi.date()
        .iso()
        .min(Joi.ref("start_date"))
        .optional()

});

const validateRecentTransactions = (query) => {

    return recentTransactionsSchema.validate(query, {

        abortEarly: false,
        stripUnknown: true

    });

};

module.exports = {
    validateRecentTransactions
};