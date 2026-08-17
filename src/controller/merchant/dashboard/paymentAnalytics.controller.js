// src/controllers/dashboard/paymentAnalytics.controller.js

const {
    validatePaymentAnalytics
} = require("../../../validations/dashboard/paymentAnalytics.validation");

const {
    getPaymentAnalytics
} = require("../../../services/dashboard/paymentAnalytics.service");

/**
 * Payment Analytics Controller
 */
const paymentAnalytics = async (req, res) => {

    try {

        // ==========================================
        // Validate Request
        // ==========================================

        const {
            error,
            value
        } = validatePaymentAnalytics(req.query);

        if (error) {

            return res.status(400).json({

                success: false,

                message: "Validation failed.",

                errors: error.details.map(detail => detail.message)

            });

        }

        // ==========================================
        // Merchant ID
        // ==========================================

        const merchantId = req.user.merchant_id;

        // ==========================================
        // Fetch Payment Analytics
        // ==========================================

        const analytics =
            await getPaymentAnalytics(
                merchantId,
                value
            );

        // ==========================================
        // Success Response
        // ==========================================

        return res.status(200).json({

            success: true,

            message: "Payment analytics fetched successfully.",

            data: analytics

        });

    } catch (error) {

        console.error(
            "Payment Analytics Controller Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Internal Server Error."

        });

    }

};

module.exports = {
    paymentAnalytics
};