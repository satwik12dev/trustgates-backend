const validateKyc = require("../../../validations/kyc/kyc.validation");
const { uploadKycService } = require("../../../services/kyc/kyc.service");
const sendKycReceivedEmail = require("../../../services/email/sendKycReceivedEmail");

const uploadKyc = async (req, res, next) => {

    try {

        const validatedData = validateKyc(req);

        const result = await uploadKycService(
            req.user.merchant_id,
            validatedData,
            req.files
        );

        // ==========================================
        // Send KYC Received Email
        // ==========================================

        await sendKycReceivedEmail(
            req.user.merchant_name,
            req.user.email
        ).catch((err) => {

            console.error(
                "Failed to send KYC confirmation email:",
                err
            );

        });

        // ==========================================
        // Response
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                "Your KYC documents have been submitted successfully. We'll verify them and notify you shortly.",

            data: {

                kyc_status:
                    result.status,

                account_status:
                    result.accountStatus || "PENDING"

            }

        });

    } catch (error) {

        next(error);

    }

};

module.exports = {
    uploadKyc
};

module.exports = {
    uploadKyc
};