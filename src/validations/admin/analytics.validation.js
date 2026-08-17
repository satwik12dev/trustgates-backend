const Joi = require("joi");


// ==========================================================
// ANALYTICS VALIDATION
// ==========================================================

const analyticsValidation = Joi.object({

    type: Joi.string()
        .valid("PAYIN", "PAYOUT")
        .uppercase()
        .default("PAYIN"),

    merchantId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .empty("")
        .default(null),

    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow(null)
        .empty("")
        .default(null),

    startDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow(null)
        .empty("")
        .default(null),

    endDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow(null)
        .empty("")
        .default(null),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)

})
.custom((value, helpers) => {

    // ======================================================
    // date AND date range cannot be used together
    // ======================================================

    if (
        value.date &&
        (
            value.startDate ||
            value.endDate
        )
    ) {

        return helpers.error(
            "any.custom",
            {
                message:
                    "Use either date or startDate/endDate, not both."
            }
        );

    }


    // ======================================================
    // startDate and endDate must come together
    // ======================================================

    if (
        (
            value.startDate &&
            !value.endDate
        ) ||
        (
            !value.startDate &&
            value.endDate
        )
    ) {

        return helpers.error(
            "any.custom",
            {
                message:
                    "startDate and endDate must be provided together."
            }
        );

    }


    // ======================================================
    // Start date cannot be greater than end date
    // ======================================================

    if (
        value.startDate &&
        value.endDate &&
        value.startDate > value.endDate
    ) {

        return helpers.error(
            "any.custom",
            {
                message:
                    "startDate cannot be greater than endDate."
            }
        );

    }


    return value;

})
.messages({

    "any.custom":
        "{{#message}}"

});


// ==========================================================
// EXPORT
// ==========================================================

module.exports = analyticsValidation