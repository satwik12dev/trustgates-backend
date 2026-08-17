const Joi = require("joi");


// ==========================================================
// COMMON REFUND FILTERS
// ==========================================================

const refundFiltersSchema = Joi.object({

    merchantId: Joi.number()
        .integer()
        .positive()
        .allow(null, "")
        .default(null),

    refundStatus: Joi.string()
        .valid(
            "CREATED",
            "PROCESSING",
            "PROCESSED",
            "FAILED"
        )
        .allow(null, "")
        .default(null),

    refundType: Joi.string()
        .valid(
            "FULL",
            "PARTIAL",
            "FAILED",
            "CANCELLED"
        )
        .allow(null, "")
        .default(null),

    startDate: Joi.date()
        .iso()
        .allow(null, "")
        .default(null),

    endDate: Joi.date()
        .iso()
        .allow(null, "")
        .default(null),

    search: Joi.string()
        .trim()
        .max(255)
        .allow(null, "")
        .default(null)

})
.custom((value, helpers) => {

    if (
        value.startDate &&
        value.endDate &&
        new Date(value.startDate) >=
        new Date(value.endDate)
    ) {

        return helpers.error(
            "any.invalid"
        );

    }

    return value;

})
.messages({

    "any.invalid":
        "startDate must be earlier than endDate."

});


// ==========================================================
// REFUND LIST
// GET /refunds
// ==========================================================

const refundListValidation =
    refundFiltersSchema.keys({

        page: Joi.number()
            .integer()
            .min(1)
            .default(1),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(20)

    });


// ==========================================================
// REFUND SUMMARY
// GET /refunds/summary
// ==========================================================

const refundSummaryValidation =
    Joi.object({

        merchantId:
            refundFiltersSchema
                .extract("merchantId"),

        startDate:
            Joi.date()
                .iso()
                .required(),

        endDate:
            Joi.date()
                .iso()
                .required()

    })
    .custom((value, helpers) => {

        if (
            new Date(value.startDate) >=
            new Date(value.endDate)
        ) {

            return helpers.error(
                "any.invalid"
            );

        }

        return value;

    })
    .messages({

        "any.invalid":
            "startDate must be earlier than endDate."

    });


// ==========================================================
// RECENT REFUNDS
// GET /refunds/recent
// ==========================================================

const recentRefundValidation =
    Joi.object({

        merchantId:
            refundFiltersSchema
                .extract("merchantId"),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(50)
            .default(10)

    });


// ==========================================================
// REFUND ANALYTICS
// GET /refunds/analytics
// ==========================================================

const refundAnalyticsValidation =
    Joi.object({

        merchantId:
            refundFiltersSchema
                .extract("merchantId"),

        startDate:
            Joi.date()
                .iso()
                .required(),

        endDate:
            Joi.date()
                .iso()
                .required()

    })
    .custom((value, helpers) => {

        if (
            new Date(value.startDate) >=
            new Date(value.endDate)
        ) {

            return helpers.error(
                "any.invalid"
            );

        }

        return value;

    })
    .messages({

        "any.invalid":
            "startDate must be earlier than endDate."

    });


// ==========================================================
// MERCHANT REFUND ANALYTICS
// GET /refunds/merchant
// ==========================================================

const merchantRefundAnalyticsValidation =
    Joi.object({

        merchantId:
            refundFiltersSchema
                .extract("merchantId"),

        startDate:
            Joi.date()
                .iso()
                .required(),

        endDate:
            Joi.date()
                .iso()
                .required()

    })
    .custom((value, helpers) => {

        if (
            new Date(value.startDate) >=
            new Date(value.endDate)
        ) {

            return helpers.error(
                "any.invalid"
            );

        }

        return value;

    })
    .messages({

        "any.invalid":
            "startDate must be earlier than endDate."

    });


// ==========================================================
// REFUND STATUS ANALYTICS
// GET /refunds/status
// ==========================================================

const refundStatusAnalyticsValidation =
    Joi.object({

        merchantId:
            refundFiltersSchema
                .extract("merchantId"),

        startDate:
            Joi.date()
                .iso()
                .required(),

        endDate:
            Joi.date()
                .iso()
                .required()

    })
    .custom((value, helpers) => {

        if (
            new Date(value.startDate) >=
            new Date(value.endDate)
        ) {

            return helpers.error(
                "any.invalid"
            );

        }

        return value;

    })
    .messages({

        "any.invalid":
            "startDate must be earlier than endDate."

    });


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    refundFiltersSchema,

    refundListValidation,

    refundSummaryValidation,

    recentRefundValidation,

    refundAnalyticsValidation,

    merchantRefundAnalyticsValidation,

    refundStatusAnalyticsValidation

};