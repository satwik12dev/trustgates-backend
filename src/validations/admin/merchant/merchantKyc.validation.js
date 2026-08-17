const Joi = require("joi");

// ==========================================================
// Upload Merchant KYC
// ==========================================================

const uploadMerchantKycValidation = Joi.object({

    panNumber: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
        .required()
        .messages({
            "string.empty": "PAN number is required.",
            "string.pattern.base": "Invalid PAN number."
        }),

    aadhaarNumber: Joi.string()
        .trim()
        .pattern(/^[2-9]{1}[0-9]{11}$/)
        .required()
        .messages({
            "string.empty": "Aadhaar number is required.",
            "string.pattern.base": "Invalid Aadhaar number."
        })

});

// ==========================================================
// Approve / Reject KYC
// ==========================================================

const verifyMerchantKycValidation = Joi.object({

    kycStatus: Joi.string()
        .valid(
            "APPROVED",
            "REJECTED"
        )
        .required()
        .messages({
            "any.only": "KYC status must be APPROVED or REJECTED."
        }),

    verificationNotes: Joi.string()
        .trim()
        .max(1000)
        .allow("", null)
        .messages({
            "string.max": "Verification notes cannot exceed 1000 characters."
        })

});

// ==========================================================
// Merchant ID
// ==========================================================

const merchantIdValidation = Joi.object({

    merchantId: Joi.number()
        .integer()
        .positive()
        .required()

});

// ==========================================================
// Regenerate KYC
// ==========================================================

const resubmitKycValidation = Joi.object({

    panNumber: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
        .required(),

    aadhaarNumber: Joi.string()
        .trim()
        .pattern(/^[2-9]{1}[0-9]{11}$/)
        .required()

});

module.exports = {

    uploadMerchantKycValidation,

    verifyMerchantKycValidation,

    merchantIdValidation,

    resubmitKycValidation

};