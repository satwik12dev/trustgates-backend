const Joi = require("joi");


// ==========================================================
// COMMON WALLET FILTERS
// ==========================================================

const walletFiltersSchema = Joi.object({

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

    walletName: Joi.string()
        .trim()
        .max(100)
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
// WALLET DASHBOARD / LIST
// GET /wallet
// ==========================================================

const walletListValidation =
    walletFiltersSchema.keys({

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
// WALLET SUMMARY
// GET /wallet/summary
// ==========================================================

const walletSummaryValidation =
    Joi.object({

        merchantId:
            walletFiltersSchema
                .extract("merchantId"),

        startDate:
            Joi.date()
                .iso()
                .allow(null, "")
                .default(null),

        endDate:
            Joi.date()
                .iso()
                .allow(null, "")
                .default(null)

    })
    .custom((value, helpers) => {

        if (
            (value.startDate && !value.endDate) ||
            (!value.startDate && value.endDate)
        ) {

            return helpers.error(
                "any.invalid"
            );

        }

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
            "startDate and endDate must be provided together, and startDate must be earlier than endDate."

    });


// ==========================================================
// RECENT WALLET TRANSACTIONS
// GET /wallet/recent
// ==========================================================

const recentWalletValidation =
    Joi.object({

        merchantId:
            walletFiltersSchema
                .extract("merchantId"),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(50)
            .default(10)

    });


// ==========================================================
// WALLET ANALYTICS
// GET /wallet/analytics
// ==========================================================

const walletAnalyticsValidation =
    Joi.object({

        merchantId:
            walletFiltersSchema
                .extract("merchantId"),

        startDate:
            Joi.date()
                .iso()
                .allow(null, "")
                .default(null),

        endDate:
            Joi.date()
                .iso()
                .allow(null, "")
                .default(null)

    })
    .custom((value, helpers) => {

        if (
            (value.startDate && !value.endDate) ||
            (!value.startDate && value.endDate)
        ) {

            return helpers.error(
                "any.invalid"
            );

        }

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
            "startDate and endDate must be provided together, and startDate must be earlier than endDate."

    });


// ==========================================================
// WALLET STATUS ANALYTICS
// GET /wallet/status
// ==========================================================

const walletStatusValidation =
    Joi.object({

        merchantId:
            walletFiltersSchema
                .extract("merchantId"),

        startDate:
            Joi.date()
                .iso()
                .allow(null, "")
                .default(null),

        endDate:
            Joi.date()
                .iso()
                .allow(null, "")
                .default(null)

    })
    .custom((value, helpers) => {

        if (
            (value.startDate && !value.endDate) ||
            (!value.startDate && value.endDate)
        ) {

            return helpers.error(
                "any.invalid"
            );

        }

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
            "startDate and endDate must be provided together, and startDate must be earlier than endDate."

    });


// ==========================================================
// TOP WALLETS
// GET /wallet/top
// ==========================================================

const topWalletsValidation =
    Joi.object({

        merchantId:
            walletFiltersSchema
                .extract("merchantId"),

        startDate:
            Joi.date()
                .iso()
                .allow(null, "")
                .default(null),

        endDate:
            Joi.date()
                .iso()
                .allow(null, "")
                .default(null)

    })
    .custom((value, helpers) => {

        if (
            (value.startDate && !value.endDate) ||
            (!value.startDate && value.endDate)
        ) {

            return helpers.error(
                "any.invalid"
            );

        }

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
            "startDate and endDate must be provided together, and startDate must be earlier than endDate."

    });


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    walletFiltersSchema,

    walletListValidation,

    walletSummaryValidation,

    recentWalletValidation,

    walletAnalyticsValidation,

    walletStatusValidation,

    topWalletsValidation

};