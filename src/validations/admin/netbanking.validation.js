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
// COMMON NET BANKING FILTERS
// ==========================================================

const netBankingFiltersSchema =
    Joi.object({

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
// NET BANKING DASHBOARD
// GET /netbanking
// ==========================================================

const netBankingDashboardValidation =
    netBankingFiltersSchema.keys({

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
// NET BANKING SUMMARY
// GET /netbanking/summary
// ==========================================================

const netBankingSummaryValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// RECENT NET BANKING
// GET /netbanking/recent
// ==========================================================

const recentNetBankingValidation =
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
// BANK ANALYTICS
// GET /netbanking/banks
// ==========================================================

const netBankBankAnalyticsValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// ACCOUNT TYPE ANALYTICS
// GET /netbanking/account-types
// ==========================================================

const accountTypeValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// STATUS ANALYTICS
// GET /netbanking/status
// ==========================================================

const netBankingStatusValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// MERCHANT ANALYTICS
// GET /netbanking/merchant
// ==========================================================

const merchantNetBankingValidation =
    dateRangeSchema.keys({

        merchantId: Joi.number()
            .integer()
            .positive()
            .allow(null, "")
            .default(null)

    });


// ==========================================================
// BANK CODE ANALYTICS
// GET /netbanking/bank-codes
// ==========================================================

const bankCodeValidation =
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

    netBankingFiltersSchema,

    netBankingDashboardValidation,

    netBankingSummaryValidation,

    recentNetBankingValidation,

    netBankBankAnalyticsValidation,

    accountTypeValidation,

    netBankingStatusValidation,

    merchantNetBankingValidation,

    bankCodeValidation

};