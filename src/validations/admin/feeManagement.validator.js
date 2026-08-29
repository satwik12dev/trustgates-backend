// ==========================================================
// Admin Fee Management Validators
// ==========================================================

const {
    body,
    param,
    query,
    validationResult
} = require("express-validator");


// ==========================================================
// Constants
// ==========================================================

const PAYMENT_METHODS = [
    "UPI",
    "CARD",
    "NETBANKING",
    "WALLET",
    "EMI",
    "PAYLATER"
];

const FEE_TYPES = [
    "FIXED",
    "PERCENTAGE",
    "HYBRID",
    "DYNAMIC"
];

const FEE_STATUSES = [
    "ACTIVE",
    "INACTIVE"
];


// ==========================================================
// Validation Result Middleware
// ==========================================================

const validateRequest = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({

            success: false,

            message: "Validation failed.",

            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))

        });

    }

    next();
};


// ==========================================================
// Merchant ID Param
// ==========================================================

const validateMerchantId = [

    param("merchantId")
        .exists()
        .withMessage("Merchant ID is required.")

        .bail()

        .isInt({
            min: 1
        })
        .withMessage("Merchant ID must be a valid positive integer."),

    validateRequest
];


// ==========================================================
// Fee ID Param
// ==========================================================

const validateFeeId = [

    param("feeId")
        .exists()
        .withMessage("Fee ID is required.")

        .bail()

        .isInt({
            min: 1
        })
        .withMessage("Fee ID must be a valid positive integer."),

    validateRequest
];


// ==========================================================
// Create Fee
// ==========================================================

const validateCreateFee = [

    param("merchantId")
        .exists()
        .withMessage("Merchant ID is required.")

        .bail()

        .isInt({
            min: 1
        })
        .withMessage("Merchant ID must be a valid positive integer."),


    body("paymentMethod")
        .exists()
        .withMessage("Payment method is required.")

        .bail()

        .isIn(PAYMENT_METHODS)
        .withMessage(
            `Payment method must be one of: ${PAYMENT_METHODS.join(", ")}.`
        ),


    body("feeType")
        .exists()
        .withMessage("Fee type is required.")

        .bail()

        .isIn(FEE_TYPES)
        .withMessage(
            `Fee type must be one of: ${FEE_TYPES.join(", ")}.`
        ),


    body("fixedFee")
        .optional({
            nullable: true
        })

        .isDecimal({
            decimal_digits: "0,2"
        })
        .withMessage(
            "Fixed fee must be a valid decimal with up to 2 decimal places."
        )

        .bail()

        .custom(value => {

            if (Number(value) < 0) {
                throw new Error(
                    "Fixed fee cannot be negative."
                );
            }

            return true;
        }),


    body("percentageFee")
        .optional({
            nullable: true
        })

        .isDecimal({
            decimal_digits: "0,4"
        })
        .withMessage(
            "Percentage fee must be a valid decimal with up to 4 decimal places."
        )

        .bail()

        .custom(value => {

            const percentage = Number(value);

            if (
                percentage < 0 ||
                percentage > 100
            ) {
                throw new Error(
                    "Percentage fee must be between 0 and 100."
                );
            }

            return true;
        }),


    body("minFee")
        .optional({
            nullable: true
        })

        .isDecimal({
            decimal_digits: "0,2"
        })
        .withMessage(
            "Minimum fee must be a valid decimal with up to 2 decimal places."
        )

        .bail()

        .custom(value => {

            if (Number(value) < 0) {
                throw new Error(
                    "Minimum fee cannot be negative."
                );
            }

            return true;
        }),


    body("maxFee")
        .optional({
            nullable: true
        })

        .isDecimal({
            decimal_digits: "0,2"
        })
        .withMessage(
            "Maximum fee must be a valid decimal with up to 2 decimal places."
        )

        .bail()

        .custom(value => {

            if (Number(value) < 0) {
                throw new Error(
                    "Maximum fee cannot be negative."
                );
            }

            return true;
        }),


    body("gstPercentage")
        .optional()

        .isDecimal({
            decimal_digits: "0,2"
        })
        .withMessage(
            "GST percentage must be a valid decimal with up to 2 decimal places."
        )

        .bail()

        .custom(value => {

            const gst = Number(value);

            if (
                gst < 0 ||
                gst > 100
            ) {
                throw new Error(
                    "GST percentage must be between 0 and 100."
                );
            }

            return true;
        }),


    body("effectiveFrom")
        .exists()
        .withMessage("Effective from is required.")

        .bail()

        .isISO8601()
        .withMessage(
            "Effective from must be a valid date/time."
        ),


    body("effectiveTo")
        .optional({
            nullable: true
        })

        .isISO8601()
        .withMessage(
            "Effective to must be a valid date/time."
        )


        .bail()

        .custom((value, {
            req
        }) => {

            if (!value || !req.body.effectiveFrom) {
                return true;
            }

            const from =
                new Date(req.body.effectiveFrom);

            const to =
                new Date(value);

            if (to <= from) {
                throw new Error(
                    "Effective to must be greater than effective from."
                );
            }

            return true;
        }),


    body("status")
        .optional()

        .isIn(FEE_STATUSES)
        .withMessage(
            `Status must be one of: ${FEE_STATUSES.join(", ")}.`
        ),


    body("remarks")
        .optional({
            nullable: true
        })

        .isString()
        .withMessage("Remarks must be a string.")

        .bail()

        .isLength({
            max: 500
        })
        .withMessage(
            "Remarks cannot exceed 500 characters."
        ),


    // ------------------------------------------------------
    // Fee Type Specific Validation
    // ------------------------------------------------------

    body()
        .custom((body) => {

            const feeType =
                body.feeType;

            const fixedFee =
                body.fixedFee;

            const percentageFee =
                body.percentageFee;

            if (
                feeType === "FIXED" &&
                fixedFee === undefined
            ) {
                throw new Error(
                    "Fixed fee is required for FIXED fee type."
                );
            }

            if (
                feeType === "PERCENTAGE" &&
                percentageFee === undefined
            ) {
                throw new Error(
                    "Percentage fee is required for PERCENTAGE fee type."
                );
            }

            if (
                feeType === "HYBRID" &&
                (
                    fixedFee === undefined ||
                    percentageFee === undefined
                )
            ) {
                throw new Error(
                    "Fixed fee and percentage fee are required for HYBRID fee type."
                );
            }

            if (
                feeType === "DYNAMIC" &&
                fixedFee === undefined &&
                percentageFee === undefined
            ) {
                throw new Error(
                    "At least one fee component is required for DYNAMIC fee type."
                );
            }

            if (
                body.minFee !== undefined &&
                body.maxFee !== undefined &&
                Number(body.minFee) > Number(body.maxFee)
            ) {
                throw new Error(
                    "Minimum fee cannot be greater than maximum fee."
                );
            }

            return true;
        }),


    validateRequest
];


// ==========================================================
// Update Fee
// ==========================================================

const validateUpdateFee = [

    param("feeId")
        .exists()
        .withMessage("Fee ID is required.")

        .bail()

        .isInt({
            min: 1
        })
        .withMessage(
            "Fee ID must be a valid positive integer."
        ),


    body("paymentMethod")
        .optional()

        .isIn(PAYMENT_METHODS)
        .withMessage(
            `Payment method must be one of: ${PAYMENT_METHODS.join(", ")}.`
        ),


    body("feeType")
        .optional()

        .isIn(FEE_TYPES)
        .withMessage(
            `Fee type must be one of: ${FEE_TYPES.join(", ")}.`
        ),


    body("fixedFee")
        .optional({
            nullable: true
        })

        .isDecimal({
            decimal_digits: "0,2"
        })
        .withMessage(
            "Fixed fee must be a valid decimal with up to 2 decimal places."
        )

        .bail()

        .custom(value => {

            if (Number(value) < 0) {
                throw new Error(
                    "Fixed fee cannot be negative."
                );
            }

            return true;
        }),


    body("percentageFee")
        .optional({
            nullable: true
        })

        .isDecimal({
            decimal_digits: "0,4"
        })
        .withMessage(
            "Percentage fee must be a valid decimal with up to 4 decimal places."
        )

        .bail()

        .custom(value => {

            const percentage = Number(value);

            if (
                percentage < 0 ||
                percentage > 100
            ) {
                throw new Error(
                    "Percentage fee must be between 0 and 100."
                );
            }

            return true;
        }),


    body("minFee")
        .optional({
            nullable: true
        })

        .isDecimal({
            decimal_digits: "0,2"
        })
        .withMessage(
            "Minimum fee must be a valid decimal with up to 2 decimal places."
        )
        .bail()

        .custom(value => {

            if (Number(value) < 0) {
                throw new Error(
                    "Minimum fee cannot be negative."
                );
            }

            return true;
        }),


    body("maxFee")
        .optional({
            nullable: true
        })

        .isDecimal({
            decimal_digits: "0,2"
        })
        .withMessage(
            "Maximum fee must be a valid decimal with up to 2 decimal places."
        )
        .bail()

        .custom(value => {

            if (Number(value) < 0) {
                throw new Error(
                    "Maximum fee cannot be negative."
                );
            }

            return true;
        }),


    body("gstPercentage")
        .optional()

        .isDecimal({
            decimal_digits: "0,2"
        })
        .withMessage(
            "GST percentage must be a valid decimal with up to 2 decimal places."
        )
        .bail()

        .custom(value => {

            const gst = Number(value);

            if (
                gst < 0 ||
                gst > 100
            ) {
                throw new Error(
                    "GST percentage must be between 0 and 100."
                );
            }

            return true;
        }),


    body("effectiveFrom")
        .optional()

        .isISO8601()
        .withMessage(
            "Effective from must be a valid date/time."
        ),


    body("effectiveTo")
        .optional({
            nullable: true
        })

        .isISO8601()
        .withMessage(
            "Effective to must be a valid date/time."
        )


        .bail()

        .custom((value, {
            req
        }) => {

            if (!value || !req.body.effectiveFrom) {
                return true;
            }

            const from =
                new Date(req.body.effectiveFrom);

            const to =
                new Date(value);

            if (to <= from) {
                throw new Error(
                    "Effective to must be greater than effective from."
                );
            }

            return true;
        }),


    body("status")
        .optional()

        .isIn(FEE_STATUSES)
        .withMessage(
            `Status must be one of: ${FEE_STATUSES.join(", ")}.`
        ),


    body("remarks")
        .optional({
            nullable: true
        })

        .isString()
        .withMessage(
            "Remarks must be a string."
        )

        .bail()

        .isLength({
            max: 500
        })
        .withMessage(
            "Remarks cannot exceed 500 characters."
        ),


    body()
        .custom((body) => {

            if (
                body.minFee !== undefined &&
                body.maxFee !== undefined &&
                Number(body.minFee) > Number(body.maxFee)
            ) {
                throw new Error(
                    "Minimum fee cannot be greater than maximum fee."
                );
            }

            return true;
        }),


    validateRequest
];


// ==========================================================
// Update Fee Status
// ==========================================================

const validateUpdateFeeStatus = [

    param("feeId")
        .exists()
        .withMessage("Fee ID is required.")

        .bail()

        .isInt({
            min: 1
        })
        .withMessage(
            "Fee ID must be a valid positive integer."
        ),


    body("status")
        .exists()
        .withMessage("Status is required.")

        .bail()

        .isIn(FEE_STATUSES)
        .withMessage(
            `Status must be one of: ${FEE_STATUSES.join(", ")}.`
        ),


    validateRequest
];


// ==========================================================
// List Fees Query
// ==========================================================

const validateListFees = [

    query("merchantId")
        .optional()

        .isInt({
            min: 1
        })
        .withMessage(
            "Merchant ID must be a valid positive integer."
        ),


    query("paymentMethod")
        .optional()

        .isIn(PAYMENT_METHODS)
        .withMessage(
            `Payment method must be one of: ${PAYMENT_METHODS.join(", ")}.`
        ),


    query("feeType")
        .optional()

        .isIn(FEE_TYPES)
        .withMessage(
            `Fee type must be one of: ${FEE_TYPES.join(", ")}.`
        ),


    query("status")
        .optional()

        .isIn(FEE_STATUSES)
        .withMessage(
            `Status must be one of: ${FEE_STATUSES.join(", ")}.`
        ),


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


    validateRequest
];


// ==========================================================
// Exports
// ==========================================================

module.exports = {

    validateRequest,

    validateMerchantId,

    validateFeeId,

    validateCreateFee,

    validateUpdateFee,

    validateUpdateFeeStatus,

    validateListFees

};