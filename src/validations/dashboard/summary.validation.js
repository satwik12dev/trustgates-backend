const Joi = require("joi");

/**
 * Dashboard Summary Validation
 */
const dashboardSummarySchema = Joi.object({

    start_date: Joi.date()
        .iso()
        .optional(),

    end_date: Joi.date()
        .iso()
        .min(Joi.ref("start_date"))
        .optional()

});

const validateDashboardSummary = (query) => {

    return dashboardSummarySchema.validate(query, {

        abortEarly: false,
        stripUnknown: true

    });

};

module.exports = {
    validateDashboardSummary
};