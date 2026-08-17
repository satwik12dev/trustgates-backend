const Joi = require("joi");

const transactionValidation = Joi.object({

    transactionId: Joi.number()
        .integer()
        .positive()
        .optional(),

    orderId: Joi.string()
        .trim()
        .optional(),

    merchantId: Joi.number()
        .integer()
        .positive()
        .optional(),

    customerName: Joi.string()
        .trim()
        .optional(),

    customerEmail: Joi.string()
        .email()
        .optional(),

    paymentMethod: Joi.string()
        .valid(
            "UPI",
            "CARD",
            "NETBANKING",
            "WALLET",
            "EMI",
            "PAYLATER"
        )
        .optional(),

    status: Joi.string()
        .valid(
            "SUCCESS",
            "FAILED",
            "PENDING",
            "CHARGEBACK",
            "REFUNDED"
        )
        .optional(),

    minAmount: Joi.number()
        .min(0)
        .optional(),

    maxAmount: Joi.number()
        .min(Joi.ref("minAmount"))
        .optional(),

    startDate: Joi.date()
        .iso()
        .optional(),

    endDate: Joi.date()
        .iso()
        .min(Joi.ref("startDate"))
        .optional(),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    sortBy: Joi.string()
        .valid(
            "created_at",
            "amount",
            "status"
        )
        .default("created_at"),

    sortOrder: Joi.string()
        .valid("ASC", "DESC")
        .default("DESC")

});

module.exports = transactionValidation;