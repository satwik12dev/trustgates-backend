const Joi = require("joi");


// ==========================================================
// COMMON DATE VALIDATION
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
// COMMON UPI FILTERS
// ==========================================================

const upiFiltersSchema = Joi.object({

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
// UPI DASHBOARD
// GET /upi
// ==========================================================

const upiDashboardValidation =
    upiFiltersSchema.keys({

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
// UPI SUMMARY
// GET /upi/summary
// ==========================================================

const upiSummaryValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// RECENT UPI TRANSACTIONS
// GET /upi/recent
// ==========================================================

const recentUpiValidation =
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
// UPI ANALYTICS
// GET /upi/analytics
// ==========================================================

const upiAnalyticsValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// BANK ANALYTICS
// GET /upi/banks
// ==========================================================

const bankAnalyticsValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// MERCHANT UPI ANALYTICS
// GET /upi/merchant
// ==========================================================

const merchantUpiValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// UPI VERIFICATION ANALYTICS
// GET /upi/verification
// ==========================================================

const upiVerificationValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    dateRangeSchema,

    upiFiltersSchema,

    upiDashboardValidation,

    upiSummaryValidation,

    recentUpiValidation,

    upiAnalyticsValidation,

    bankAnalyticsValidation,

    merchantUpiValidation,

    upiVerificationValidation

};