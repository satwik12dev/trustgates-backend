const Joi = require("joi");


// ==========================================================
// COMMON DATE RANGE
// ==========================================================

const dateRangeSchema = Joi.object({

    startDate: Joi.date()
        .iso()
        .allow(null, "")
        .default(null),

    endDate: Joi.date()
        .iso()
        .allow(null, "")
        .default(null)

})
.custom((value, helpers) => {

    if (
        (value.startDate && !value.endDate) ||
        (!value.startDate && value.endDate)
    ) {
        return helpers.error("any.invalid");
    }

    if (
        value.startDate &&
        value.endDate &&
        new Date(value.startDate) >=
        new Date(value.endDate)
    ) {
        return helpers.error("any.invalid");
    }

    return value;

})
.messages({

    "any.invalid":
        "startDate and endDate must be provided together, and startDate must be earlier than endDate."

});


// ==========================================================
// COMMON PAY LATER FILTERS
// ==========================================================

const payLaterFiltersSchema = Joi.object({

    merchantId: Joi.number()
        .integer()
        .positive()
        .allow(null, "")
        .default(null),

    status: Joi.string()
        .valid(
            "CREATED",
            "PENDING",
            "AUTHORIZED",
            "SUCCESS",
            "FAILED",
            "CANCELLED",
            "REFUNDED",
            "PARTIALLY_REFUNDED",
            "CHARGEBACK"
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
        (value.startDate && !value.endDate) ||
        (!value.startDate && value.endDate)
    ) {
        return helpers.error("any.invalid");
    }

    if (
        value.startDate &&
        value.endDate &&
        new Date(value.startDate) >=
        new Date(value.endDate)
    ) {
        return helpers.error("any.invalid");
    }

    return value;

})
.messages({

    "any.invalid":
        "startDate and endDate must be provided together, and startDate must be earlier than endDate."

});


// ==========================================================
// PAY LATER DASHBOARD
// GET /paylater
// ==========================================================

const payLaterDashboardValidation =
    payLaterFiltersSchema.keys({

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
// PAY LATER SUMMARY
// GET /paylater/summary
// ==========================================================

const payLaterSummaryValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// RECENT PAY LATER
// GET /paylater/recent
// ==========================================================

const recentPayLaterValidation =
    Joi.object({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(50)
            .default(10)

    });


// ==========================================================
// PROVIDER ANALYTICS
// GET /paylater/providers
// ==========================================================

const providerAnalyticsValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// DUE DATE ANALYTICS
// GET /paylater/due-dates
// ==========================================================

const dueDateAnalyticsValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// MERCHANT ANALYTICS
// GET /paylater/merchant
// ==========================================================

const merchantPayLaterValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// DAILY ANALYTICS
// GET /paylater/daily
// ==========================================================

const dailyPayLaterValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// UPCOMING DUE PAYMENTS
// GET /paylater/upcoming-due
// ==========================================================

const upcomingDuePaymentsValidation =
    Joi.object({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(20)

    });


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    dateRangeSchema,

    payLaterFiltersSchema,

    payLaterDashboardValidation,

    payLaterSummaryValidation,

    recentPayLaterValidation,

    providerAnalyticsValidation,

    dueDateAnalyticsValidation,

    merchantPayLaterValidation,

    dailyPayLaterValidation,

    upcomingDuePaymentsValidation

};