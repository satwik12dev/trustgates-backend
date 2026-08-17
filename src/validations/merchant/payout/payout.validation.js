const validatePayoutAnalytics = (req, res, next) => {
    try {

        // ==========================================
        // Get Merchant ID From Authentication
        // ==========================================

        const merchantId = req.user?.merchant_id;

        if (!merchantId) {
            return res.status(401).json({
                success: false,
                message: "Merchant authentication required."
            });
        }

        if (
            !Number.isInteger(Number(merchantId)) ||
            Number(merchantId) <= 0
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid merchant authentication."
            });
        }


        // ==========================================
        // Get Date Filters
        // ==========================================

        const {
            startDate,
            endDate
        } = req.query;


        // ==========================================
        // Validate Start Date
        // ==========================================

        if (startDate && !isValidDate(startDate)) {
            return res.status(400).json({
                success: false,
                message: "Start date must be in YYYY-MM-DD format."
            });
        }


        // ==========================================
        // Validate End Date
        // ==========================================

        if (endDate && !isValidDate(endDate)) {
            return res.status(400).json({
                success: false,
                message: "End date must be in YYYY-MM-DD format."
            });
        }


        // ==========================================
        // Both Dates Must Be Provided Together
        // ==========================================

        if (
            (startDate && !endDate) ||
            (!startDate && endDate)
        ) {
            return res.status(400).json({
                success: false,
                message: "Both startDate and endDate are required."
            });
        }


        // ==========================================
        // Validate Date Range
        // ==========================================

        if (
            startDate &&
            endDate &&
            startDate > endDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be greater than end date."
            });
        }


        // ==========================================
        // Attach Validated Data
        // ==========================================

        req.payoutAnalytics = {
            merchantId: Number(merchantId),
            startDate: startDate || null,
            endDate: endDate || null
        };

        next();

    } catch (error) {

        console.error(
            "Payout Validation Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Validation failed."
        });
    }
};


// ==========================================
// Date Validation
// ==========================================

const isValidDate = (date) => {

    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        return false;
    }

    const parsedDate = new Date(
        `${date}T00:00:00`
    );

    if (Number.isNaN(parsedDate.getTime())) {
        return false;
    }

    const [
        year,
        month,
        day
    ] = date.split("-").map(Number);

    return (
        parsedDate.getFullYear() === year &&
        parsedDate.getMonth() + 1 === month &&
        parsedDate.getDate() === day
    );
};


module.exports = {
    validatePayoutAnalytics
};