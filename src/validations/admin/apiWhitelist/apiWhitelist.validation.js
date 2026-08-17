const Joi = require("joi");

// ==========================================================
// Add IP
// ==========================================================

const addIpValidation = Joi.object({

    ipAddress: Joi.string()
        .ip({
            version: [
                "ipv4",
                "ipv6"
            ]
        })
        .required()
        .messages({

            "any.required": "IP address is required.",

            "string.ip": "Please enter a valid IPv4 or IPv6 address."

        })

});

// ==========================================================
// Update IP
// ==========================================================

const updateIpValidation = Joi.object({

    ipAddress: Joi.string()
        .ip({
            version: [
                "ipv4",
                "ipv6"
            ]
        })
        .required()
        .messages({

            "any.required": "IP address is required.",

            "string.ip": "Please enter a valid IPv4 or IPv6 address."

        })

});

// ==========================================================
// Update IP Status
// ==========================================================

const updateIpStatusValidation = Joi.object({

    status: Joi.string()
        .valid(

            "ACTIVE",

            "INACTIVE"

        )
        .required()
        .messages({

            "any.required": "Status is required.",

            "any.only": "Status must be ACTIVE or INACTIVE."

        })

});

// ==========================================================
// Exports
// ==========================================================

module.exports = {

    addIpValidation,

    updateIpValidation,

    updateIpStatusValidation

};