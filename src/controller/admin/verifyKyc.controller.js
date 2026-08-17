const verifyKycValidation = require("../../validations/admin/verifyKyc.validation");
const { verifyKycService } = require("../../services/admin/verifyKyc.service");

const verifyKyc = async (req, res, next) => {
    try {
        const { error } = verifyKycValidation.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { merchantId } = req.params;
        const { action, verification_notes } = req.body;

        const adminId = req.admin.admin_id;

        const result = await verifyKycService(
            merchantId,
            adminId,
            action,
            verification_notes
        );

        return res.status(200).json({
            success: true,
            message:
                result.status === "APPROVED"
                    ? "KYC approved successfully."
                    : "KYC rejected successfully.",
            data: {
                merchant_id: Number(merchantId),
                kyc_status: result.status
            }
        });

    } catch (error) {

        if (error.message === "KYC record not found.") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message === "Merchant not found.") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes("already")) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
};

module.exports = verifyKyc;