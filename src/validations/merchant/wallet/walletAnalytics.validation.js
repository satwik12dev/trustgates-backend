const { query } = require("express-validator");


// ==========================================================
// Wallet Analytics Validation
// ==========================================================

const walletAnalyticsValidation = [


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

            "Invalid wallet source."

        )


];


module.exports = walletAnalyticsValidation;