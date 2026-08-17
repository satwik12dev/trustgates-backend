const Joi = require("joi");

// ==========================================================
// Create Merchant
// ==========================================================

const createMerchantValidation = Joi.object({

    businessName: Joi.string()
        .trim()
        .min(3)
        .max(255)
        .required()
        .messages({
            "any.required": "Business name is required.",
            "string.empty": "Business name is required.",
            "string.min":
                "Business name must be at least 3 characters.",
            "string.max":
                "Business name cannot exceed 255 characters."
        }),

    merchantName: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            "any.required": "Merchant name is required.",
            "string.empty": "Merchant name is required.",
            "string.min":
                "Merchant name must be at least 3 characters.",
            "string.max":
                "Merchant name cannot exceed 100 characters."
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(255)
        .required()
        .messages({
            "any.required": "Email is required.",
            "string.empty": "Email is required.",
            "string.email":
                "Please enter a valid email address.",
            "string.max":
                "Email cannot exceed 255 characters."
        }),

    phone: Joi.string()
        .trim()
        .pattern(/^[6-9]\d{9}$/)
        .required()
        .messages({
            "any.required":
                "Phone number is required.",
            "string.empty":
                "Phone number is required.",
            "string.pattern.base":
                "Please enter a valid 10-digit mobile number."
        }),

    website: Joi.string()
        .trim()
        .allow("", null)
        .uri({
            scheme: [
                "http",
                "https"
            ]
        })
        .max(255)
        .messages({
            "string.uri":
                "Please enter a valid website URL.",
            "string.max":
                "Website URL cannot exceed 255 characters."
        }),

    password: Joi.string()
        .min(12)
        .max(128)
        .required()
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
        )
        .messages({

            "any.required":
                "Password is required.",

            "string.empty":
                "Password is required.",

            "string.min":
                "Password must be at least 12 characters.",

            "string.max":
                "Password cannot exceed 128 characters.",

            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."

        })

})
    .unknown(false);


// ==========================================================
// Update Merchant
// ==========================================================

const updateMerchantValidation = Joi.object({

    businessName: Joi.string()
        .trim()
        .min(3)
        .max(255),

    merchantName: Joi.string()
        .trim()
        .min(3)
        .max(100),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(255),

    phone: Joi.string()
        .trim()
        .pattern(/^[6-9]\d{9}$/),

    website: Joi.string()
        .trim()
        .allow("", null)
        .uri({
            scheme: [
                "http",
                "https"
            ]
        })
        .max(255)

})
    .min(1)
    .unknown(false);


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
// Update Account Status
// ==========================================================

const updateAccountStatusValidation = Joi.object({

    accountStatus: Joi.string()
        .valid(
            "ACTIVE",
            "HOLD",
            "OFFLINE",
            "BLOCKED"
        )
        .required()

});


// ==========================================================
// Approve / Reject Merchant
// ==========================================================

const updateApprovalStatusValidation = Joi.object({

    approvalStatus: Joi.string()
        .valid(
            "APPROVED",
            "REJECTED"
        )
        .required(),

    verificationNotes: Joi.string()
        .trim()
        .max(1000)
        .allow("", null)

})
    .unknown(false);


// ==========================================================
// Generate API Credentials
// ==========================================================

const generateApiCredentialValidation = Joi.object({

    environment: Joi.string()
        .valid(
            "SANDBOX",
            "PRODUCTION"
        )
        .required(),

    webhookUrl: Joi.string()
        .trim()
        .uri({
            scheme: [
                "http",
                "https"
            ]
        })
        .max(255)
        .allow("", null),

    ipWhitelist: Joi.array()
        .items(
            Joi.string().ip()
        )
        .max(50)
        .default([])

})
    .unknown(false);


module.exports = {

    createMerchantValidation,

    updateMerchantValidation,

    merchantIdValidation,

    updateAccountStatusValidation,

    updateApprovalStatusValidation,

    generateApiCredentialValidation

};