// src/controllers/dashboard/refundSummary.controller.js

const {
    validateRefundSummary
} = require("../../../validations/dashboard/refundSummary.validation");

const {
    getRefundSummary
} = require("../../../services/dashboard/refundSummary.service");

/**
 * Refund Summary Controller
 */
const refundSummary = async (req, res) => {

    try {

        // ==========================================
        // Validate Request
        // ==========================================

        const {
            error,
            value
        } = validateRefundSummary(req.query);

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
        // Fetch Refund Summary
        // ==========================================

        const refunds =
            await getRefundSummary(
                merchantId,
                value
            );

        // ==========================================
        // Success Response
        // ==========================================

        return res.status(200).json({

            success: true,

            message: "Refund summary fetched successfully.",

            data: refunds

        });

    } catch (error) {

        console.error(
            "Refund Summary Controller Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Internal Server Error."

        });

    }

};

module.exports = {
    refundSummary
};