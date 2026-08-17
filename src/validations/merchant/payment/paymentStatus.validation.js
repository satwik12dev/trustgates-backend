const {
    param
} = require("express-validator");


// ==========================================================
// Payment Status Validation
// ==========================================================

const paymentStatusValidation = [


    param("transactionRef")
        .trim()
        .notEmpty()
        .withMessage(
            "Transaction reference is required."
        )
        .isLength({
            min:5,
            max:100
        })
        .withMessage(
            "Invalid transaction reference."
        )


];


module.exports = paymentStatusValidation;