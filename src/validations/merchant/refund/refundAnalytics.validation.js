const {
    query
} = require("express-validator");


// ==========================================================
// Refund Analytics Validation
// ==========================================================

const refundAnalyticsValidation = [


    query("from")
        .optional()
        .isISO8601()
        .withMessage(
            "Invalid start date."
        ),



    query("to")
        .optional()
        .isISO8601()
        .withMessage(
            "Invalid end date."
        ),



    query("period")
        .optional()
        .isIn([
            "TODAY",
            "WEEK",
            "MONTH",
            "YEAR"
        ])
        .withMessage(
            "Invalid analytics period."
        )


];


module.exports = refundAnalyticsValidation;