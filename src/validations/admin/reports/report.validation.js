const Joi = require("joi");

// Common pagination
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

// Common filters
const commonFilters = {
  merchantId: Joi.number().integer().positive(),
  status: Joi.string().valid(
    "SUCCESS",
    "FAILED",
    "PENDING",
    "REFUNDED",
    "CHARGEBACK"
  ),
  paymentMethod: Joi.string().valid(
    "UPI",
    "CARD",
    "NETBANKING",
    "WALLET",
    "EMI",
    "PAYLATER"
  ),
  currency: Joi.string().uppercase().length(3),
  search: Joi.string().allow("", null),
};

// Daily Report Validation
const dailyReportValidation = Joi.object({
  date: Joi.date().required(),
  ...commonFilters,
  page: paginationSchema.extract("page"),
  limit: paginationSchema.extract("limit"),
});

const exportDailyReportValidation = Joi.object({
    date: Joi.date().required(),
    merchantId: Joi.number().optional(),
    format: Joi.string()
        .valid("CSV", "EXCEL", "PDF")
        .required()
});

// Monthly Report Validation
const monthlyReportValidation = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  merchantId: commonFilters.merchantId,
  status: commonFilters.status,
});

const exportMonthlyReportValidation = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  merchantId: Joi.number().optional(),
  format: Joi.string()
    .valid("CSV", "EXCEL", "PDF")
    .required()
});

// Merchant Report Validation
const merchantReportValidation = Joi.object({

    merchantId: Joi.number()
        .integer()
        .positive()
        .required(),

    startDate: Joi.date().required(),

    endDate: Joi.date()
        .min(Joi.ref("startDate"))
        .required(),

    status: commonFilters.status,

    paymentMethod: commonFilters.paymentMethod,

    format: Joi.string()
        .valid("CSV", "EXCEL", "PDF")
        .uppercase()
        .required()


});



// Export Report Validation
const exportReportValidation = Joi.object({
  reportType: Joi.string()
    .valid(
      "DAILY",
      "MONTHLY",
      "MERCHANT",
      "TRANSACTIONS",
      "REFUNDS",
      "SETTLEMENTS"
    )
    .required(),

  format: Joi.string()
    .valid("CSV", "EXCEL", "PDF")
    .required(),

  merchantId: commonFilters.merchantId,
  status: commonFilters.status,
  paymentMethod: commonFilters.paymentMethod,

  date: Joi.date(),

  month: Joi.number().integer().min(1).max(12),

  year: Joi.number().integer().min(2000).max(2100),

  startDate: Joi.date(),

  endDate: Joi.date().min(Joi.ref("startDate")),
}).custom((value, helpers) => {
  // Daily Report
  if (value.reportType === "DAILY" && !value.date) {
    return helpers.error("any.invalid", {
      message: "date is required for DAILY report",
    });
  }

  // Monthly Report
  if (
    value.reportType === "MONTHLY" &&
    (!value.month || !value.year)
  ) {
    return helpers.error("any.invalid", {
      message: "month and year are required for MONTHLY report",
    });
  }

  // Merchant Report
  if (
    value.reportType === "MERCHANT" &&
    !value.merchantId
  ) {
    return helpers.error("any.invalid", {
      message: "merchantId is required for MERCHANT report",
    });
  }

  return value;
});

// Recent Reports Validation
const reportHistoryValidation = Joi.object({
  page: paginationSchema.extract("page"),
  limit: paginationSchema.extract("limit"),
});

module.exports = {
  dailyReportValidation,
  monthlyReportValidation,
  merchantReportValidation,
  exportReportValidation,
  reportHistoryValidation,
  exportDailyReportValidation,
  exportMonthlyReportValidation
};