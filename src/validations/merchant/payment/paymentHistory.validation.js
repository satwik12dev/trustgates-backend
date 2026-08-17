const {
    query
} = require("express-validator");


// ==========================================================
// Payment History Validation
// ==========================================================

const paymentHistoryValidation = [


    // ======================================================
    // Pagination
    // ======================================================

    query("page")

        .optional()

        .isInt({

            min: 1

        })

        .withMessage(

            "Page must be a positive integer."

        ),



    query("limit")

        .optional()

        .isInt({

            min: 1,

            max: 100

        })

        .withMessage(

            "Limit must be between 1 and 100."

        ),



    // ======================================================
    // Payment Status Filter
    // ======================================================

    query("status")

        .optional()

        .isIn([

            "SUCCESS",

            "FAILED",

            "PENDING",

            "REFUNDED",

            "PARTIALLY_REFUNDED",

            "CHARGEBACK"

        ])

        .withMessage(

            "Invalid payment status."

        ),



    // ======================================================
    // Payment Method Filter
    // ======================================================

    query("payment_method")

        .optional()

        .isIn([

            "UPI",

            "CARD",

            "NETBANKING",

            "WALLET",

            "EMI",

            "PAYLATER"

        ])

        .withMessage(

            "Invalid payment method."

        ),



    // ======================================================
    // Payment Type Filter
    // ======================================================

    query("payment_type")

        .optional()

        .isIn([

            "PAYIN",

            "PAYOUT"

        ])

        .withMessage(

            "Invalid payment type."

        ),



    // ======================================================
    // Date Filters
    // ======================================================

    query("start_date")

        .optional()

        .isISO8601()

        .withMessage(

            "Invalid start date format."

        ),



    query("end_date")

        .optional()

        .isISO8601()

        .withMessage(

            "Invalid end date format."

        )


];


module.exports = paymentHistoryValidation;