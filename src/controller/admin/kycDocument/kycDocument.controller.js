const {
    viewKycDocument
} = require(
    "../../../services/admin/kycDocument/kycDocument.service"
);


// ==========================================================
// View KYC Document
// ==========================================================

const viewKycDocumentadmin = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication
        // ==================================================

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


        // ==================================================
        // Params
        // ==================================================

        const {
            merchantId,
            documentType
        } = req.params;


        // ==================================================
        // Audit Context
        // ==================================================

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


        // ==================================================
        // View KYC Document
        // ==================================================

        const result =
            await viewKycDocument(

                merchantId,

                documentType,

                adminId,

                auditContext

            );


        // ==================================================
        // Service Error
        // ==================================================

        if (
            !result.success
        ) {

            return res
                .status(
                    result.statusCode || 400
                )
                .json(result);

        }


        // ==================================================
        // Send Document
        // ==================================================

        return res.sendFile(

            result.filePath,

            {

                headers: {

                    "Content-Disposition":
                        `inline; filename="${result.fileName}"`

                }

            }

        );

    } catch (error) {

        next(error);

    }

};


module.exports = {

    viewKycDocumentadmin

};