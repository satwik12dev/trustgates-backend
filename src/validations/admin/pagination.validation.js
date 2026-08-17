const Joi = require("joi");

const paginationValidation = Joi.object({

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    sortBy: Joi.string()
        .default("created_at"),

    sortOrder: Joi.string()
        .valid(
            "ASC",
            "DESC"
        )
        .default("DESC")

});

module.exports = paginationValidation;