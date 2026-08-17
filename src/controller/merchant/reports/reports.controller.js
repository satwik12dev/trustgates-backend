const {
    dailyReportValidation,
    monthlyReportValidation
} = require(
    "../../../validations/merchant/reports/reports.validation"
);

const {
    getDailyReport,
    getMonthlyReport
} = require(
    "../../../services/merchant/reports/reports.service"
);


// ==========================================================
// DAILY REPORT
// ==========================================================

const getDaily = async (
    req,
    res,
    next
) => {

    try {

        // ==============================================
        // Validate Request
        // ==============================================

        const {
            error,
            value
        } =
            dailyReportValidation.validate(
                req.query
            );


        if (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.details[0].message

            });

        }


        // ==============================================
        // Merchant From JWT
        // ==============================================

        const merchantId =
            req.user.merchant_id;


        // ==============================================
        // Get Daily Report
        // ==============================================

        const report =
            await getDailyReport(

                merchantId,

                value.date

            );


        // ==============================================
        // Response
        // ==============================================

        return res.status(200).json({

            success: true,

            message:
                "Daily report fetched successfully.",

            data:
                report

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// MONTHLY REPORT
// ==========================================================

const getMonthly = async (
    req,
    res,
    next
) => {

    try {

        // ==============================================
        // Validate Request
        // ==============================================

        const {
            error,
            value
        } =
            monthlyReportValidation.validate(
                req.query
            );


        if (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.details[0].message

            });

        }


        // ==============================================
        // Merchant From JWT
        // ==============================================

        const merchantId =
            req.user.merchant_id;


        // ==============================================
        // Get Monthly Report
        // ==============================================

        const report =
            await getMonthlyReport(

                merchantId,

                value.month,

                value.year

            );


        // ==============================================
        // Response
        // ==============================================

        return res.status(200).json({

            success: true,

            message:
                "Monthly report fetched successfully.",

            data:
                report

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    getDaily,

    getMonthly

};