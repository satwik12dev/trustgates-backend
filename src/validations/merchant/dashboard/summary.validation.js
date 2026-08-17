const {
    query
} = require("express-validator");



// ==========================================================
// Dashboard Summary Validation
// ==========================================================

const summaryValidation = [


    // ======================================================
    // Optional Start Date Filter
    // ======================================================

    query("start_date")

        .optional()

        .isISO8601()

        .withMessage(
            "Invalid start date format."
        ),



    // ======================================================
    // Optional End Date Filter
    // ======================================================

    query("end_date")

        .optional()

        .isISO8601()

        .withMessage(
            "Invalid end date format."
        )



];



module.exports = summaryValidation;