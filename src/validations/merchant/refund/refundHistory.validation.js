const {
    query
} = require("express-validator");


// ==========================================================
// Refund History Validation
// ==========================================================

const refundHistoryValidation = [

    query("page")
        .optional()
        .isInt({
            min:1
        })
        .withMessage(
            "Page must be a positive number."
        ),


    query("limit")
        .optional()
        .isInt({
            min:1,
            max:100
        })
        .withMessage(
            "Limit must be between 1 and 100."
        ),



    query("status")
        .optional()
        .isIn([
            "REQUESTED",
            "APPROVED",
            "REJECTED",
            "PROCESSING",
            "COMPLETED",
            "FAILED",
            "CANCELLED"
        ])
        .withMessage(
            "Invalid refund status."
        ),



    query("refund_type")
        .optional()
        .isIn([
            "FULL",
            "PARTIAL"
        ])
        .withMessage(
            "Invalid refund type."
        ),



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
        )

];


module.exports = refundHistoryValidation;