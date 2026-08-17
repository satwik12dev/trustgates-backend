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
// COMMON EMI FILTERS
// ==========================================================

const emiFiltersSchema = Joi.object({

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
// EMI DASHBOARD
// GET /emi
// ==========================================================

const emiDashboardValidation =
    emiFiltersSchema.keys({

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
// EMI SUMMARY
// GET /emi/summary
// ==========================================================

const emiSummaryValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// RECENT EMI TRANSACTIONS
// GET /emi/recent
// ==========================================================

const recentEmiValidation =
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
// EMI BANK / ISSUER ANALYTICS
// GET /emi/banks
// ==========================================================

const emiBankAnalyticsValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// EMI CARD NETWORK ANALYTICS
// GET /emi/card-networks
// ==========================================================

const emiCardNetworkValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// EMI TENURE ANALYTICS
// GET /emi/tenures
// ==========================================================

const emiTenureValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// MERCHANT EMI ANALYTICS
// GET /emi/merchant
// ==========================================================

const merchantEmiValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// INTEREST RATE ANALYTICS
// GET /emi/interest-rates
// ==========================================================

const interestRateValidation =
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

    emiFiltersSchema,

    emiDashboardValidation,

    emiSummaryValidation,

    recentEmiValidation,

    emiBankAnalyticsValidation,

    emiCardNetworkValidation,

    emiTenureValidation,

    merchantEmiValidation,

    interestRateValidation

};