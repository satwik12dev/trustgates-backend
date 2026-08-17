const Joi = require("joi");


// ==========================================================
// DAILY REPORT VALIDATION
// ==========================================================

const dailyReportValidation = Joi.object({

    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({

            "string.empty":
                "Date is required.",

            "string.pattern.base":
                "Date must be in YYYY-MM-DD format.",

            "any.required":
                "Date is required."

        })

});


// ==========================================================
// MONTHLY REPORT VALIDATION
// ==========================================================

const monthlyReportValidation = Joi.object({

    month: Joi.number()
        .integer()
        .min(1)
        .max(12)
        .required()
        .messages({

            "number.base":
                "Month must be a number.",

            "number.integer":
                "Month must be an integer.",

            "number.min":
                "Month must be between 1 and 12.",

            "number.max":
                "Month must be between 1 and 12.",

            "any.required":
                "Month is required."

        }),

    year: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
        .required()
        .messages({

            "number.base":
                "Year must be a number.",

            "number.integer":
                "Year must be an integer.",

            "number.min":
                "Invalid year.",

            "number.max":
                "Invalid year.",

            "any.required":
                "Year is required."

        })

});


// ==========================================================
// DAILY EXPORT VALIDATION
// ==========================================================

const dailyExportValidation = Joi.object({

    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({

            "string.empty":
                "Date is required.",

            "string.pattern.base":
                "Date must be in YYYY-MM-DD format.",

            "any.required":
                "Date is required."

        }),

    format: Joi.string()
        .uppercase()
        .valid(
            "CSV",
            "EXCEL",
            "PDF"
        )
        .required()
        .messages({

            "any.only":
                "Format must be CSV, EXCEL or PDF.",

            "any.required":
                "Export format is required."

        })

});


// ==========================================================
// MONTHLY EXPORT VALIDATION
// ==========================================================

const monthlyExportValidation = Joi.object({

    month: Joi.number()
        .integer()
        .min(1)
        .max(12)
        .required()
        .messages({

            "number.base":
                "Month must be a number.",

            "number.integer":
                "Month must be an integer.",

            "number.min":
                "Month must be between 1 and 12.",

            "number.max":
                "Month must be between 1 and 12.",

            "any.required":
                "Month is required."

        }),

    year: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
        .required()
        .messages({

            "number.base":
                "Year must be a number.",

            "number.integer":
                "Year must be an integer.",

            "number.min":
                "Invalid year.",

            "number.max":
                "Invalid year.",

            "any.required":
                "Year is required."

        }),

    format: Joi.string()
        .uppercase()
        .valid(
            "CSV",
            "EXCEL",
            "PDF"
        )
        .required()
        .messages({

            "any.only":
                "Format must be CSV, EXCEL or PDF.",

            "any.required":
                "Export format is required."

        })

});


// ==========================================================
// Export
// ==========================================================

module.exports = {

    dailyReportValidation,

    monthlyReportValidation,

    dailyExportValidation,

    monthlyExportValidation

};