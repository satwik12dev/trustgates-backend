const Joi = require("joi");

const {
    getDailyReportService,
    getDailyTransactionsService,
    searchDailyTransactionsService,
    filterDailyTransactionsService,
    exportDailyReportService
} = require("../../../services/admin/reports/dailyReport.service");


/**
 * ============================================================
 * VALIDATION
 * ============================================================
 */

/**
 * Common Daily Report Validation
 */
const dailyReportValidation = Joi.object({

    date: Joi.date()
        .required()
        .messages({
            "date.base": "Valid date is required.",
            "any.required": "Date is required."
        }),

    merchantId: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            "number.base": "Merchant ID must be a number.",
            "number.integer": "Merchant ID must be an integer.",
            "number.positive": "Merchant ID must be positive."
        }),

    status: Joi.string()
        .valid(
            "SUCCESS",
            "FAILED",
            "PENDING",
            "REFUNDED",
            "CHARGEBACK"
        )
        .optional()
        .messages({
            "any.only": "Invalid transaction status."
        }),

    paymentMethod: Joi.string()
        .valid(
            "UPI",
            "CARD",
            "NETBANKING",
            "WALLET",
            "EMI",
            "PAYLATER"
        )
        .optional()
        .messages({
            "any.only": "Invalid payment method."
        }),

    paymentType: Joi.string()
        .optional(),

    currency: Joi.string()
        .uppercase()
        .length(3)
        .optional()
        .messages({
            "string.length": "Currency must be exactly 3 characters."
        }),

    search: Joi.string()
        .allow("", null)
        .optional(),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            "number.integer": "Page must be an integer.",
            "number.min": "Page must be at least 1."
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            "number.integer": "Limit must be an integer.",
            "number.min": "Limit must be at least 1.",
            "number.max": "Limit cannot exceed 100."
        })

});


/**
 * Export Daily Report Validation
 */
const exportDailyReportValidation = Joi.object({

    date: Joi.date()
        .required()
        .messages({
            "date.base": "Valid date is required.",
            "any.required": "Date is required."
        }),

    merchantId: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            "number.base": "Merchant ID must be a number.",
            "number.integer": "Merchant ID must be an integer.",
            "number.positive": "Merchant ID must be positive."
        }),

    format: Joi.string()
        .valid("CSV", "EXCEL", "PDF")
        .required()
        .uppercase()
        .messages({
            "any.only": "Format must be CSV, EXCEL, or PDF.",
            "any.required": "Export format is required."
        })

});


/**
 * ============================================================
 * GET DAILY REPORT
 * GET /admin/reports/daily
 * ============================================================
 */

const getDailyReport = async (req, res) => {

    try {

        const { error, value } =
            dailyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const report =
            await getDailyReportService(value);

        return res.status(200).json({

            success: true,

            message: "Daily report fetched successfully.",

            data: report

        });

    } catch (error) {

        console.error("Daily Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch daily report.",

            error: error.message

        });

    }

};


/**
 * ============================================================
 * GET DAILY TRANSACTIONS
 * GET /admin/reports/daily/transactions
 * ============================================================
 */

const getDailyTransactions = async (req, res) => {

    try {

        const { error, value } =
            dailyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const transactions =
            await getDailyTransactionsService(value);

        return res.status(200).json({

            success: true,

            message: "Daily transactions fetched successfully.",

            data: transactions

        });

    } catch (error) {

        console.error("Daily Transactions Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch daily transactions.",

            error: error.message

        });

    }

};


/**
 * ============================================================
 * SEARCH DAILY TRANSACTIONS
 * GET /admin/reports/daily/search
 * ============================================================
 */

const searchDailyTransactions = async (req, res) => {

    try {

        const { error, value } =
            dailyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await searchDailyTransactionsService(value);

        return res.status(200).json({

            success: true,

            message: "Daily transactions fetched successfully.",

            data: result

        });

    } catch (error) {

        console.error("Search Daily Transactions Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to search daily transactions.",

            error: error.message

        });

    }

};


/**
 * ============================================================
 * FILTER DAILY TRANSACTIONS
 * GET /admin/reports/daily/filter
 * ============================================================
 */

const filterDailyTransactions = async (req, res) => {

    try {

        const { error, value } =
            dailyReportValidation.validate(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await filterDailyTransactionsService(value);

        return res.status(200).json({

            success: true,

            message: "Daily transactions fetched successfully.",

            data: result

        });

    } catch (error) {

        console.error("Filter Daily Transactions Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to filter daily transactions.",

            error: error.message

        });

    }

};


/**
 * ============================================================
 * EXPORT DAILY REPORT
 * POST /admin/reports/daily/export
 * ============================================================
 */

const exportDailyReport = async (req, res) => {

    try {

        const { error, value } =
            exportDailyReportValidation.validate(req.body);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.details[0].message

            });

        }

        const result =
            await exportDailyReportService(value);

        return res.status(200).json({

            success: true,

            message: "Daily report exported successfully.",

            data: result

        });

    } catch (error) {

        console.error("Export Daily Report Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to export daily report.",

            error: error.message

        });

    }

};


/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {

    getDailyReport,

    getDailyTransactions,

    searchDailyTransactions,

    filterDailyTransactions,

    exportDailyReport

};
