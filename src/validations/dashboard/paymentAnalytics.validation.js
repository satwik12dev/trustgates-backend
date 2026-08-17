const Joi = require("joi");

const paymentAnalyticsSchema = Joi.object({

    period: Joi.string()
        .valid(
            "today",
            "yesterday",
            "last_7_days",
            "last_30_days",
            "last_90_days",
            "this_month",
            "last_month",
            "this_year",
            "custom"
        )
        .default("last_30_days"),

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

    start_date: Joi.date()
        .iso()
        .when("period", {
            is: "custom",
            then: Joi.required(),
            otherwise: Joi.optional()
        }),

    end_date: Joi.date()
        .iso()
        .when("period", {
            is: "custom",
            then: Joi.date()
                .min(Joi.ref("start_date"))
                .required(),
            otherwise: Joi.optional()
        })

});

const validatePaymentAnalytics = (query) => {

    return paymentAnalyticsSchema.validate(query, {
        abortEarly: false,
        stripUnknown: true
    });

};

module.exports = {
    validatePaymentAnalytics
};