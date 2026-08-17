// src/controllers/dashboard/settlementSummary.controller.js

const {
    validateSettlementSummary
} = require("../../../validations/dashboard/settlementSummary.validation");

const {
    getSettlementSummary
} = require("../../../services/dashboard/settlementSummary.service");

/**
 * Settlement Summary Controller
 */
const settlementSummary = async (req, res) => {

    try {

        // ==========================================
        // Validate Request
        // ==========================================

        const {
            error,
            value
        } = validateSettlementSummary(req.query);

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
        // Fetch Settlement Summary
        // ==========================================

        const settlements =
            await getSettlementSummary(
                merchantId,
                value
            );

        // ==========================================
        // Success Response
        // ==========================================

        return res.status(200).json({

            success: true,

            message: "Settlement summary fetched successfully.",

            data: settlements

        });

    } catch (error) {

        console.error(
            "Settlement Summary Controller Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Internal Server Error."

        });

    }

};

module.exports = {
    settlementSummary
};