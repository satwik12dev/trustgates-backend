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
// COMMON CARD FILTERS
// ==========================================================

const cardFiltersSchema = Joi.object({

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
// CARD DASHBOARD
// GET /card
// ==========================================================

const cardDashboardValidation =
    cardFiltersSchema.keys({

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
// CARD SUMMARY
// GET /card/summary
// ==========================================================

const cardSummaryValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// RECENT CARD TRANSACTIONS
// GET /card/recent
// ==========================================================

const recentCardValidation =
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
// CARD NETWORK ANALYTICS
// GET /card/network
// ==========================================================

const cardNetworkValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// CARD TYPE ANALYTICS
// GET /card/type
// ==========================================================

const cardTypeValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// ISSUING BANK ANALYTICS
// GET /card/banks
// ==========================================================

const issuingBankValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// MERCHANT CARD ANALYTICS
// GET /card/merchant
// ==========================================================

const merchantCardValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// CARD COUNTRY ANALYTICS
// GET /card/country
// ==========================================================

const cardCountryValidation =
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

    cardFiltersSchema,

    cardDashboardValidation,

    cardSummaryValidation,

    recentCardValidation,

    cardNetworkValidation,

    cardTypeValidation,

    issuingBankValidation,

    merchantCardValidation,

    cardCountryValidation

};