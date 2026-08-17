const { query } = require("express-validator");


// ==========================================================
// Wallet History Validation
// ==========================================================

const walletHistoryValidation = [

    query("page")

        .optional()

        .isInt({

            min:1

        })

        .withMessage(

            "Page must be a positive integer."

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



    query("source")

        .optional()

        .isIn([

            "PAYMENT",

            "REFUND",

            "SETTLEMENT",

            "FEE",

            "ADJUSTMENT"

        ])

        .withMessage(

            "Invalid wallet transaction source."

        ),



    query("transaction_type")

        .optional()

        .isIn([

            "CREDIT",

            "DEBIT"

        ])

        .withMessage(

            "Invalid transaction type."

        ),



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


module.exports = walletHistoryValidation;