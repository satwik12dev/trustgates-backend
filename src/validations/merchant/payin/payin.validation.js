// ==========================================================
// Validate Payin Analytics Query
// ==========================================================

const validatePayinAnalytics = (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Merchant Authentication
        // ==================================================

        const merchantId =
            req.user?.merchant_id;

        if (
            !merchantId ||
            !Number.isInteger(
                Number(merchantId)
            ) ||
            Number(merchantId) <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Merchant authentication required."

            });

        }


        // ==================================================
        // Query Parameters
        // ==================================================

        const {
            startDate,
            endDate
        } = req.query;


        // ==================================================
        // Date Format
        // ==================================================

        if (
            startDate &&
            !isValidDate(startDate)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "startDate must be in YYYY-MM-DD format."

            });

        }


        if (
            endDate &&
            !isValidDate(endDate)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "endDate must be in YYYY-MM-DD format."

            });

        }


        // ==================================================
        // Both Dates Required
        // ==================================================

        if (
            (
                startDate &&
                !endDate
            ) ||
            (
                !startDate &&
                endDate
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Both startDate and endDate are required."

            });

        }


        // ==================================================
        // Date Range
        // ==================================================

        if (
            startDate &&
            endDate &&
            startDate > endDate
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "startDate cannot be greater than endDate."

            });

        }


        // ==================================================
        // Store Validated Data
        // ==================================================

        req.payinAnalytics = {

            merchantId:
                Number(merchantId),

            startDate:
                startDate || null,

            endDate:
                endDate || null

        };


        next();

    } catch (error) {

        console.error(
            "Payin Analytics Validation Error:",
            error
        );

        next(error);

    }

};


// ==========================================================
// Date Validator
// ==========================================================

const isValidDate = (
    date
) => {

    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {

        return false;

    }


    const [
        year,
        month,
        day
    ] =
        date
            .split("-")
            .map(Number);


    const parsedDate =
        new Date(
            year,
            month - 1,
            day
        );


    return (
        parsedDate.getFullYear() === year &&
        parsedDate.getMonth() + 1 === month &&
        parsedDate.getDate() === day
    );

};


module.exports = {

    validatePayinAnalytics

};