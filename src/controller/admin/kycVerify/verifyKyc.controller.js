const verifyKycValidation = require("../../../validations/admin/verifyKyc.validation");

const {
    verifyKycService
} = require("../../../services/admin/verifyKyc.service");

const sendKycApprovedEmail = require("../../../services/email/sendKycApprovedEmail");

const sendKycRejectedEmail = require("../../../services/email/sendKycRejectedEmail");


// ==========================================================
// Verify / Reject / Cancel KYC
// ==========================================================

const verifyKyc = async (
    req,
    res,
    next
) => {

    try {

        // ==========================================
        // Admin Authentication
        // ==========================================

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {

            return res.status(401).json({

                success: false,

                code:
                    "ADMIN_AUTH_REQUIRED",

                message:
                    "Admin authentication is required."

            });

        }


        const adminId =
            Number(
                req.admin.admin_id
            );


        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {

            return res.status(401).json({

                success: false,

                code:
                    "INVALID_ADMIN_CONTEXT",

                message:
                    "Invalid admin authentication."

            });

        }


        // ==========================================
        // Validate Request
        // ==========================================

        const {
            error,
            value
        } =
            verifyKycValidation.validate(

                req.body,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        if (error) {

            return res.status(400).json({

                success: false,

                code:
                    "INVALID_KYC_REQUEST",

                message:
                    error.details[0].message

            });

        }


        // ==========================================
        // Request Data
        // ==========================================

        const {
            merchantId
        } = req.params;


        const {
            action,
            verification_notes
        } = value;


        const normalizedMerchantId =
            Number(merchantId);


        if (
            !Number.isInteger(
                normalizedMerchantId
            ) ||
            normalizedMerchantId <= 0
        ) {

            return res.status(400).json({

                success: false,

                code:
                    "INVALID_MERCHANT_ID",

                message:
                    "Invalid merchant ID."

            });

        }


        // ==========================================
        // Audit Context
        // ==========================================

        const auditContext = {

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==========================================
        // Verify / Reject / Cancel KYC
        // ==========================================

        const result =
            await verifyKycService(

                normalizedMerchantId,

                adminId,

                action,

                verification_notes,

                auditContext

            );


        // ==========================================
        // Service Returned Failure
        // ==========================================

        if (
            !result.success
        ) {

            return res
                .status(
                    result.statusCode || 400
                )
                .json(result);

        }


        // ==========================================
        // Send KYC Approved Email
        // ==========================================

        if (
            result.status ===
            "APPROVED"
        ) {

            sendKycApprovedEmail(

                result.merchant.merchant_name,

                result.merchant.email

            ).catch(error => {

                console.error(

                    "Failed to send KYC approved email:",

                    error.message

                );

            });

        }


        // ==========================================
        // Send KYC Rejected Email
        // ==========================================

        if (
            result.status ===
            "REJECTED"
        ) {

            sendKycRejectedEmail(

                result.merchant.merchant_name,

                result.merchant.email,

                verification_notes

            ).catch(error => {

                console.error(

                    "Failed to send KYC rejected email:",

                    error.message

                );

            });

        }


        // ==========================================
        // CANCELLED
        //
        // No email currently sent.
        // ==========================================

        if (
            result.status ===
            "CANCELLED"
        ) {

            console.log(
                `KYC cancelled for merchant ${normalizedMerchantId}`
            );

        }


        // ==========================================
        // Response Message
        // ==========================================

        let message;

        if (
            result.status ===
            "APPROVED"
        ) {

            message =
                "KYC approved successfully.";

        } else if (
            result.status ===
            "REJECTED"
        ) {

            message =
                "KYC rejected successfully.";

        } else if (
            result.status ===
            "CANCELLED"
        ) {

            message =
                "KYC cancelled successfully.";

        } else {

            message =
                "KYC processed successfully.";

        }


        // ==========================================
        // Response
        // ==========================================

        return res
            .status(
                result.statusCode || 200
            )
            .json({

                success: true,

                message,

                data: {

                    merchant_id:
                        normalizedMerchantId,

                    kyc_status:
                        result.status,

                    email_verified:
                        result.emailVerified,

                    account_status:
                        result.accountStatus,

                    activated:
                        result.activated,

                    wallet:
                        result.wallet ||
                        null,

                    api_credentials:
                        result.apiCredentials ||
                        null

                }

            });


    } catch (error) {


        // ==========================================
        // KYC Not Found
        // ==========================================

        if (
            error.message ===
            "KYC record not found."
        ) {

            return res.status(404).json({

                success: false,

                code:
                    "KYC_NOT_FOUND",

                message:
                    error.message

            });

        }


        // ==========================================
        // Merchant Not Found
        // ==========================================

        if (
            error.message ===
            "Merchant not found."
        ) {

            return res.status(404).json({

                success: false,

                code:
                    "MERCHANT_NOT_FOUND",

                message:
                    error.message

            });

        }


        // ==========================================
        // Already Processed
        // ==========================================

        if (
            error.message &&
            error.message.includes(
                "already"
            )
        ) {

            return res.status(409).json({

                success: false,

                code:
                    "KYC_ALREADY_PROCESSED",

                message:
                    error.message

            });

        }


        // ==========================================
        // Invalid KYC Action
        // ==========================================

        if (
            error.message ===
            "Invalid KYC action."
        ) {

            return res.status(400).json({

                success: false,

                code:
                    "INVALID_KYC_ACTION",

                message:
                    error.message

            });

        }


        // ==========================================
        // Global Error Handler
        // ==========================================

        next(error);

    }

};


// ==========================================================
// Export
// ==========================================================

module.exports = verifyKyc;