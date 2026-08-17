const fs = require("fs");
const path = require("path");

const db =
    require("../../../config/pool");

const kycDocumentQueries =
    require(
        "../../../queries/admin/kycDocument/kycDocument.query"
    );


// ==========================================================
// Audit
// ==========================================================

const {
    createAuditLog
} = require(
    "../audit/audit.service"
);

const {
    AUDIT_ACTIONS,
    AUDIT_ENTITY_TYPES,
    AUDIT_STATUS
} = require(
    "../../../utils/admin/audti.actions"
);


// ==========================================================
// View KYC Document
// ==========================================================

const viewKycDocument = async (

    merchantId,

    documentType,

    adminId,

    auditContext = {}

) => {

    try {

        // ==================================================
        // Validate Admin
        // ==================================================

        const normalizedAdminId =
            Number(adminId);


        if (
            !Number.isInteger(
                normalizedAdminId
            ) ||
            normalizedAdminId <= 0
        ) {

            return {

                success: false,

                statusCode: 401,

                message:
                    "Valid admin authentication is required."

            };

        }


        // ==================================================
        // Validate Merchant ID
        // ==================================================

        const normalizedMerchantId =
            Number(merchantId);


        if (
            !Number.isInteger(
                normalizedMerchantId
            ) ||
            normalizedMerchantId <= 0
        ) {

            return {

                success: false,

                statusCode: 400,

                message:
                    "Invalid merchant ID."

            };

        }


        // ==================================================
        // Validate Document Type
        // ==================================================

        const normalizedDocumentType =
            String(
                documentType || ""
            )
                .trim()
                .toLowerCase();


        if (
            ![
                "pan",
                "aadhaar"
            ].includes(
                normalizedDocumentType
            )
        ) {

            // ==============================================
            // Failed Audit
            // ==============================================

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .KYC_VIEWED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .KYC,

                entityId:
                    null,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress:
                    auditContext.ipAddress ||
                    null,

                userAgent:
                    auditContext.userAgent ||
                    null,

                requestId:
                    auditContext.requestId ||
                    null,

                metadata: {

                    merchantId:
                        normalizedMerchantId,

                    documentType:
                        normalizedDocumentType ||
                        null,

                    reason:
                        "INVALID_DOCUMENT_TYPE"

                }

            });


            return {

                success: false,

                statusCode: 400,

                message:
                    "Invalid document type."

            };

        }


        // ==================================================
        // Check Merchant Exists
        // ==================================================

        const [
            merchantRows
        ] = await db.query(

            kycDocumentQueries
                .CHECK_MERCHANT_EXISTS,

            [
                normalizedMerchantId
            ]

        );


        if (
            !merchantRows.length
        ) {

            // ==============================================
            // Failed Audit
            // ==============================================

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .KYC_VIEWED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .KYC,

                entityId:
                    null,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress:
                    auditContext.ipAddress ||
                    null,

                userAgent:
                    auditContext.userAgent ||
                    null,

                requestId:
                    auditContext.requestId ||
                    null,

                metadata: {

                    merchantId:
                        normalizedMerchantId,

                    documentType:
                        normalizedDocumentType,

                    reason:
                        "MERCHANT_NOT_FOUND"

                }

            });


            return {

                success: false,

                statusCode: 404,

                message:
                    "Merchant not found."

            };

        }


        // ==================================================
        // Check KYC Exists
        // ==================================================

        const [
            kycRows
        ] = await db.query(

            kycDocumentQueries
                .GET_KYC_DOCUMENTS,

            [
                normalizedMerchantId
            ]

        );


        if (
            !kycRows.length
        ) {

            // ==============================================
            // Failed Audit
            // ==============================================

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .KYC_VIEWED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .KYC,

                entityId:
                    null,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress:
                    auditContext.ipAddress ||
                    null,

                userAgent:
                    auditContext.userAgent ||
                    null,

                requestId:
                    auditContext.requestId ||
                    null,

                metadata: {

                    merchantId:
                        normalizedMerchantId,

                    documentType:
                        normalizedDocumentType,

                    reason:
                        "KYC_NOT_FOUND"

                }

            });


            return {

                success: false,

                statusCode: 404,

                message:
                    "KYC record not found."

            };

        }


        const kycData =
            kycRows[0];


        const kycId =
            kycData.kyc_id || null;


        // ==================================================
        // Select Document
        // ==================================================

        let documentPath;


        if (
            normalizedDocumentType ===
            "pan"
        ) {

            documentPath =
                kycData.pan_document;

        } else {

            documentPath =
                kycData.aadhaar_document;

        }


        // ==================================================
        // Document Uploaded?
        // ==================================================

        if (
            !documentPath
        ) {

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .KYC_VIEWED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .KYC,

                entityId:
                    kycId,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress:
                    auditContext.ipAddress ||
                    null,

                userAgent:
                    auditContext.userAgent ||
                    null,

                requestId:
                    auditContext.requestId ||
                    null,

                metadata: {

                    merchantId:
                        normalizedMerchantId,

                    documentType:
                        normalizedDocumentType,

                    reason:
                        "DOCUMENT_NOT_FOUND"

                }

            });


            return {

                success: false,

                statusCode: 404,

                message:
                    "Document not found."

            };

        }


        // ==================================================
        // Absolute File Path
        // ==================================================

        const absolutePath =
            path.join(

                process.cwd(),

                "uploads",

                "kyc",

                `merchant_${normalizedMerchantId}`,

                documentPath

            );


        // ==================================================
        // Check File Exists
        // ==================================================

        if (
            !fs.existsSync(
                absolutePath
            )
        ) {

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .KYC_VIEWED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .KYC,

                entityId:
                    kycId,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress:
                    auditContext.ipAddress ||
                    null,

                userAgent:
                    auditContext.userAgent ||
                    null,

                requestId:
                    auditContext.requestId ||
                    null,

                metadata: {

                    merchantId:
                        normalizedMerchantId,

                    documentType:
                        normalizedDocumentType,

                    reason:
                        "DOCUMENT_FILE_NOT_FOUND"

                }

            });


            return {

                success: false,

                statusCode: 404,

                message:
                    "Document file does not exist."

            };

        }


        // ==================================================
        // SUCCESS AUDIT
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .KYC_VIEWED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .KYC,

            entityId:
                kycId,

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress:
                auditContext.ipAddress ||
                null,

            userAgent:
                auditContext.userAgent ||
                null,

            requestId:
                auditContext.requestId ||
                null,

            metadata: {

                merchantId:
                    normalizedMerchantId,

                documentType:
                    normalizedDocumentType,

                action:
                    "VIEW_DOCUMENT"

            }

        });


        // ==================================================
        // Return File
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            filePath:
                absolutePath,

            fileName:
                path.basename(
                    absolutePath
                ),

            documentType:
                normalizedDocumentType

        };


    } catch (error) {

        console.error(
            "View KYC Document Error:",
            error
        );


        // ==================================================
        // Failed Audit
        // ==================================================

        try {

            await createAuditLog({

                adminId:
                    Number(adminId) || null,

                action:
                    AUDIT_ACTIONS
                        .KYC_VIEWED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .KYC,

                entityId:
                    null,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress:
                    auditContext.ipAddress ||
                    null,

                userAgent:
                    auditContext.userAgent ||
                    null,

                requestId:
                    auditContext.requestId ||
                    null,

                metadata: {

                    merchantId:
                        Number(merchantId) || null,

                    documentType:
                        documentType || null,

                    reason:
                        error.code ||
                        "KYC_DOCUMENT_VIEW_FAILED"

                }

            });

        } catch (auditError) {

            console.error(
                "KYC Document Audit Error:",
                auditError
            );

        }


        throw error;

    }

};


// ==========================================================
// Exports
// ==========================================================

module.exports = {

    viewKycDocument

};