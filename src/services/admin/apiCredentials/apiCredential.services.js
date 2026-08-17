const bcrypt = require("bcrypt");
const crypto = require("crypto");

const db = require("../../../config/pool");

const apiCredentialQueries = require(
    "../../../queries/admin/apiCredential/apiCredential.query"
);

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
// Helpers
// ==========================================================

const normalizePositiveInteger = (
    value,
    fieldName
) => {

    const normalized =
        Number(value);

    if (
        !Number.isInteger(normalized) ||
        normalized <= 0
    ) {

        throw new Error(
            `Invalid ${fieldName}.`
        );
    }

    return normalized;
};


// ==========================================================
// Generate API Keys
// ==========================================================

const generateKeys = (
    environment
) => {

    const prefix =
        environment === "PRODUCTION"
            ? "live"
            : "test";


    const publicKey =
        `pk_${prefix}_` +
        crypto
            .randomBytes(24)
            .toString("hex");


    const secretKey =
        `sk_${prefix}_` +
        crypto
            .randomBytes(32)
            .toString("hex");


    return {
        publicKey,
        secretKey
    };
};


// ==========================================================
// Generate API Credentials
// ==========================================================

const generateApiCredentials = async (

    merchantId,

    {
        environment
    },

    adminId,

    auditContext = {}

) => {

    const normalizedMerchantId =
        normalizePositiveInteger(
            merchantId,
            "merchant ID"
        );


    const normalizedAdminId =
        normalizePositiveInteger(
            adminId,
            "admin"
        );


    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        // ==================================================
        // Check Merchant
        // ==================================================

        const [merchantRows] =
            await connection.query(

                apiCredentialQueries
                    .CHECK_MERCHANT_EXISTS,

                [
                    normalizedMerchantId
                ]

            );


        if (!merchantRows.length) {

            await connection.rollback();

            throw new Error(
                "Merchant not found."
            );

        }


        const merchant =
            merchantRows[0];


        // ==================================================
        // Merchant Approval
        // ==================================================

        if (
            merchant.approval_status !==
            "APPROVED"
        ) {

            await connection.rollback();

            throw new Error(
                "Merchant is not approved."
            );

        }


        // ==================================================
        // KYC
        // ==================================================

        if (
            merchant.kyc_status !==
            "APPROVED"
        ) {

            await connection.rollback();

            throw new Error(
                "Merchant KYC is not approved."
            );

        }


        // ==================================================
        // Account Status
        // ==================================================

        if (
            merchant.account_status !==
            "ACTIVE"
        ) {

            await connection.rollback();

            throw new Error(
                "Merchant account is not active."
            );

        }


        // ==================================================
        // Existing Credential
        // ==================================================

        const [existing] =
            await connection.query(

                apiCredentialQueries
                    .CHECK_API_CREDENTIALS,

                [
                    normalizedMerchantId,
                    environment
                ]

            );


        if (existing.length) {

            await connection.rollback();

            throw new Error(
                `${environment} credentials already exist.`
            );

        }


        // ==================================================
        // Generate Keys
        // ==================================================

        const {
            publicKey,
            secretKey
        } =
            generateKeys(
                environment
            );


        // ==================================================
        // Hash Secret
        // ==================================================

        const secretKeyHash =
            await bcrypt.hash(
                secretKey,
                12
            );


        // ==================================================
        // Insert Credential
        // ==================================================

        const [credential] =
            await connection.query(

                apiCredentialQueries
                    .CREATE_API_CREDENTIALS,

                [
                    normalizedMerchantId,
                    publicKey,
                    secretKeyHash,
                    environment
                ]

            );


        if (
            credential.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to create API credentials."
            );

        }


        const credentialId =
            credential.insertId;


        // ==================================================
        // Audit Log
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .API_CREDENTIAL_CREATED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .API_CREDENTIAL,

            entityId:
                credentialId,

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

                merchantCode:
                    merchant.merchant_code,

                environment,

                credentialId,

                action:
                    "GENERATE"

            },

            connection

        });


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Response
        //
        // IMPORTANT:
        // secretKey is returned ONLY ONCE.
        // Never store it in audit logs.
        // ==================================================

        return {

            success: true,

            statusCode: 201,

            message:
                "API credentials generated successfully.",

            data: {

                credentialId,

                merchantId:
                    normalizedMerchantId,

                environment,

                publicKey,

                secretKey,

                status:
                    "ACTIVE"

            }

        };


    } catch (error) {

        try {

            await connection.rollback();

        } catch (_) {
        }


        // ==================================================
        // Failed Audit
        // ==================================================

        try {

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .API_CREDENTIAL_CREATED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .API_CREDENTIAL,

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

                    environment:
                        environment || null,

                    reason:
                        error.message,

                    action:
                        "GENERATE"

                }

            });

        } catch (auditError) {

            console.error(
                "API Credential Failed Audit Error:",
                auditError
            );

        }


        throw error;


    } finally {

        connection.release();

    }

};
// ==========================================================
// Get API Credentials
// ==========================================================

const getApiCredentials = async (

    merchantId,

    adminId,

    auditContext = {}

) => {

    const normalizedMerchantId =
        normalizePositiveInteger(
            merchantId,
            "merchant ID"
        );


    const normalizedAdminId =
        normalizePositiveInteger(
            adminId,
            "admin"
        );


    try {

        // ==================================================
        // Check Merchant
        // ==================================================

        const [
            merchantRows
        ] = await db.query(

            apiCredentialQueries
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

            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .API_CREDENTIAL_VIEWED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .API_CREDENTIAL,

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

                        reason:
                            "MERCHANT_NOT_FOUND",

                        action:
                            "VIEW"

                    }

                });

            } catch (auditError) {

                console.error(
                    "API Credential View Audit Error:",
                    auditError
                );

            }


            return {

                success: false,

                statusCode: 404,

                message:
                    "Merchant not found."

            };

        }


        const merchant =
            merchantRows[0];


        // ==================================================
        // Get Credentials
        //
        // IMPORTANT:
        // secret_key_hash is NEVER selected.
        // ==================================================

        const [
            credentialRows
        ] = await db.query(

            apiCredentialQueries
                .GET_API_CREDENTIALS,

            [
                normalizedMerchantId
            ]

        );


        // ==================================================
        // Safe Response
        // ==================================================

        const credentials =
            credentialRows.map(
                credential => ({

                    credentialId:
                        credential.credential_id,

                    merchantId:
                        credential.merchant_id,

                    publicKey:
                        credential.public_key,

                    environment:
                        credential.environment,

                    status:
                        credential.status,

                    lastUsedAt:
                        credential.last_used_at,

                    createdAt:
                        credential.created_at,

                    updatedAt:
                        credential.updated_at

                })
            );


        // ==================================================
        // Successful Audit
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .API_CREDENTIAL_VIEWED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .API_CREDENTIAL,

            entityId:
                null,

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

                merchantCode:
                    merchant.merchant_code,

                credentialCount:
                    credentials.length,

                credentialIds:
                    credentials.map(
                        credential =>
                            credential.credentialId
                    ),

                action:
                    "VIEW"

            }

        });


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                "API credentials fetched successfully.",

            data: {

                merchantId:
                    normalizedMerchantId,

                merchantCode:
                    merchant.merchant_code,

                credentials

            }

        };


    } catch (error) {

        console.error(
            "Get API Credentials Error:",
            error
        );


        // ==================================================
        // Failed Audit
        // ==================================================

        try {

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .API_CREDENTIAL_VIEWED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .API_CREDENTIAL,

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

                    reason:
                        error.code ||
                        "API_CREDENTIAL_VIEW_FAILED",

                    action:
                        "VIEW"

                }

            });

        } catch (auditError) {

            console.error(
                "API Credential Failed Audit Error:",
                auditError
            );

        }


        throw error;

    }

};

// ==========================================================
// Update API Credential Status
// ==========================================================

const updateApiStatus = async (
    credentialId,
    status,
    adminId,
    auditContext = {}
) => {

    const normalizedCredentialId =
        normalizePositiveInteger(
            credentialId,
            "credential ID"
        );

    const normalizedAdminId =
        normalizePositiveInteger(
            adminId,
            "admin"
        );


    // ==================================================
    // Validate Status
    // ==================================================

    const allowedStatuses = [
        "ACTIVE",
        "INACTIVE",
        "REVOKED"
    ];

    if (
        !allowedStatuses.includes(status)
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid API credential status."

        };

    }


    try {

        // ==================================================
        // Get Credential
        // ==================================================

        const [
            credentialRows
        ] = await db.query(

            apiCredentialQueries
                .GET_CREDENTIAL_BY_ID,

            [
                normalizedCredentialId
            ]

        );


        if (
            !credentialRows.length
        ) {

            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .API_CREDENTIAL_STATUS_CHANGED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .API_CREDENTIAL,

                    entityId:
                        normalizedCredentialId,

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

                        reason:
                            "CREDENTIAL_NOT_FOUND",

                        requestedStatus:
                            status

                    }

                });

            } catch (auditError) {

                console.error(
                    "API Credential Audit Error:",
                    auditError
                );

            }


            return {

                success: false,

                statusCode: 404,

                message:
                    "API credential not found."

            };

        }


        const credential =
            credentialRows[0];


        // ==================================================
        // Already Same Status
        // ==================================================

        if (
            credential.status === status
        ) {

            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        status === "REVOKED"
                            ? AUDIT_ACTIONS
                                .API_CREDENTIAL_REVOKED
                            : AUDIT_ACTIONS
                                .API_CREDENTIAL_STATUS_CHANGED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .API_CREDENTIAL,

                    entityId:
                        normalizedCredentialId,

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
                            credential.merchant_id,

                        environment:
                            credential.environment,

                        reason:
                            "STATUS_ALREADY_SET",

                        currentStatus:
                            credential.status,

                        requestedStatus:
                            status

                    }

                });

            } catch (auditError) {

                console.error(
                    "API Credential Audit Error:",
                    auditError
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    `API credential is already ${status}.`

            };

        }


        // ==================================================
        // Revoked Credential Protection
        // ==================================================

        if (
            credential.status === "REVOKED"
        ) {

            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .API_CREDENTIAL_STATUS_CHANGED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .API_CREDENTIAL,

                    entityId:
                        normalizedCredentialId,

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
                            credential.merchant_id,

                        environment:
                            credential.environment,

                        reason:
                            "REVOKED_CREDENTIAL_CANNOT_BE_MODIFIED",

                        currentStatus:
                            credential.status,

                        requestedStatus:
                            status

                    }

                });

            } catch (auditError) {

                console.error(
                    "API Credential Audit Error:",
                    auditError
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    "Revoked API credentials cannot be modified."

            };

        }


        // ==================================================
        // Select Audit Action
        // ==================================================

        const auditAction =
            status === "REVOKED"
                ? AUDIT_ACTIONS
                    .API_CREDENTIAL_REVOKED
                : AUDIT_ACTIONS
                    .API_CREDENTIAL_STATUS_CHANGED;


        const previousStatus =
            credential.status;


        // ==================================================
        // Update Status
        // ==================================================

        const [
            updateResult
        ] = await db.query(

            apiCredentialQueries
                .UPDATE_API_STATUS,

            [
                status,
                normalizedCredentialId
            ]

        );


        if (
            updateResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to update API credential status."
            );

        }


        // ==================================================
        // SUCCESS AUDIT
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                auditAction,

            entityType:
                AUDIT_ENTITY_TYPES
                    .API_CREDENTIAL,

            entityId:
                normalizedCredentialId,

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
                    credential.merchant_id,

                environment:
                    credential.environment,

                previousStatus,

                newStatus:
                    status

            }

        });


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                `API credential status updated to ${status}.`,

            data: {

                credentialId:
                    normalizedCredentialId,

                status

            }

        };


    } catch (error) {

        console.error(
            "Update API Credential Status Error:",
            error
        );


        // ==================================================
        // FAILED AUDIT
        // ==================================================

        try {

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    status === "REVOKED"
                        ? AUDIT_ACTIONS
                            .API_CREDENTIAL_REVOKED
                        : AUDIT_ACTIONS
                            .API_CREDENTIAL_STATUS_CHANGED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .API_CREDENTIAL,

                entityId:
                    normalizedCredentialId,

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

                    reason:
                        error.code ||
                        "STATUS_UPDATE_FAILED",

                    requestedStatus:
                        status

                }

            });

        } catch (auditError) {

            console.error(
                "API Credential Failed Audit Error:",
                auditError
            );

        }


        throw error;

    }

};

// ==========================================================
// Regenerate API Credentials
// ==========================================================

const regenerateApiCredentials = async (

    credentialId,

    adminId,

    auditContext = {}

) => {

    const normalizedCredentialId =
        normalizePositiveInteger(
            credentialId,
            "credential ID"
        );

    const normalizedAdminId =
        normalizePositiveInteger(
            adminId,
            "admin"
        );


    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        // ==================================================
        // Get Existing Credential
        // ==================================================

        const [
            credentialRows
        ] = await connection.query(

            apiCredentialQueries
                .GET_CREDENTIAL_BY_ID,

            [
                normalizedCredentialId
            ]

        );


        if (
            !credentialRows.length
        ) {

            await connection.rollback();


            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .API_CREDENTIAL_REGENERATED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .API_CREDENTIAL,

                entityId:
                    normalizedCredentialId,

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

                    reason:
                        "CREDENTIAL_NOT_FOUND"

                }

            });


            return {

                success: false,

                statusCode: 404,

                message:
                    "API credential not found."

            };

        }


        const oldCredential =
            credentialRows[0];


        // ==================================================
        // Revoked Credential Protection
        // ==================================================

        if (
            oldCredential.status ===
            "REVOKED"
        ) {

            await connection.rollback();


            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .API_CREDENTIAL_REGENERATED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .API_CREDENTIAL,

                entityId:
                    normalizedCredentialId,

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
                        oldCredential.merchant_id,

                    environment:
                        oldCredential.environment,

                    reason:
                        "REVOKED_CREDENTIAL_CANNOT_BE_REGENERATED"

                }

            });


            return {

                success: false,

                statusCode: 409,

                message:
                    "Revoked API credentials cannot be regenerated."

            };

        }


        // ==================================================
        // Check Merchant
        // ==================================================

        const [
            merchantRows
        ] = await connection.query(

            apiCredentialQueries
                .CHECK_MERCHANT_EXISTS,

            [
                oldCredential.merchant_id
            ]

        );


        if (
            !merchantRows.length
        ) {

            await connection.rollback();


            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .API_CREDENTIAL_REGENERATED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .API_CREDENTIAL,

                entityId:
                    normalizedCredentialId,

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
                        oldCredential.merchant_id,

                    environment:
                        oldCredential.environment,

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


        const merchant =
            merchantRows[0];


        // ==================================================
        // Merchant Eligibility
        // ==================================================

        if (
            merchant.approval_status !==
            "APPROVED" ||
            merchant.kyc_status !==
            "APPROVED" ||
            merchant.account_status !==
            "ACTIVE" ||
            !Boolean(
                merchant.email_verified
            )
        ) {

            await connection.rollback();


            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .API_CREDENTIAL_REGENERATED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .API_CREDENTIAL,

                entityId:
                    normalizedCredentialId,

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
                        merchant.merchant_id,

                    merchantCode:
                        merchant.merchant_code,

                    environment:
                        oldCredential.environment,

                    reason:
                        "MERCHANT_NOT_ELIGIBLE"

                }

            });


            return {

                success: false,

                statusCode: 403,

                message:
                    "API credentials can only be regenerated for an active, approved merchant with verified email and approved KYC."

            };

        }


        // ==================================================
        // Generate New Keys
        // ==================================================

        const {
            publicKey,
            secretKey
        } =
            generateKeys(
                oldCredential.environment
            );


        // ==================================================
        // Hash New Secret
        // ==================================================

        const secretKeyHash =
            await bcrypt.hash(
                secretKey,
                12
            );


        // ==================================================
        // Inactivate Old Credential
        // ==================================================

        const [
            oldCredentialResult
        ] = await connection.query(

            apiCredentialQueries
                .INACTIVATE_API_CREDENTIAL,

            [
                normalizedCredentialId
            ]

        );


        if (
            oldCredentialResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to inactivate old API credential."
            );

        }


        // ==================================================
        // Create New Credential
        // ==================================================

        const [
            newCredentialResult
        ] = await connection.query(

            apiCredentialQueries
                .CREATE_API_CREDENTIALS,

            [
                oldCredential.merchant_id,
                publicKey,
                secretKeyHash,
                oldCredential.environment
            ]

        );


        if (
            newCredentialResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to create regenerated API credential."
            );

        }


        const newCredentialId =
            newCredentialResult.insertId;


        // ==================================================
        // Audit
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .API_CREDENTIAL_REGENERATED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .API_CREDENTIAL,

            entityId:
                newCredentialId,

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
                    oldCredential.merchant_id,

                merchantCode:
                    merchant.merchant_code,

                environment:
                    oldCredential.environment,

                oldCredentialId:
                    normalizedCredentialId,

                newCredentialId,

                oldStatus:
                    oldCredential.status,

                newStatus:
                    "ACTIVE"

            },

            connection

        });


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Response
        //
        // Secret is returned ONLY ONCE.
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                "API credentials regenerated successfully. Store the new secret key securely; it will not be shown again.",

            data: {

                oldCredentialId:
                    normalizedCredentialId,

                credentialId:
                    newCredentialId,

                merchantId:
                    oldCredential.merchant_id,

                environment:
                    oldCredential.environment,

                publicKey,

                secretKey,

                status:
                    "ACTIVE"

            }

        };


    } catch (error) {

        try {

            await connection.rollback();

        } catch (_) {
        }


        console.error(
            "Regenerate API Credentials Error:",
            error
        );


        // ==================================================
        // Failed Audit
        // ==================================================

        try {

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .API_CREDENTIAL_REGENERATED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .API_CREDENTIAL,

                entityId:
                    normalizedCredentialId,

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

                    reason:
                        error.code ||
                        "API_CREDENTIAL_REGENERATION_FAILED"

                }

            });

        } catch (auditError) {

            console.error(
                "API Credential Regeneration Audit Error:",
                auditError
            );

        }


        throw error;


    } finally {

        connection.release();

    }

};

// ==========================================================
// Revoke API Credential
// ==========================================================

const revokeApiCredential = async (
    credentialId,
    adminId,
    auditContext = {}
) => {

    const normalizedCredentialId =
        normalizePositiveInteger(
            credentialId,
            "credential ID"
        );

    const normalizedAdminId =
        normalizePositiveInteger(
            adminId,
            "admin"
        );

    try {

        // ==================================================
        // Get Credential
        // ==================================================

        const [
            credentialRows
        ] = await db.query(

            apiCredentialQueries
                .GET_CREDENTIAL_BY_ID,

            [
                normalizedCredentialId
            ]

        );


        // ==================================================
        // Credential Not Found
        // ==================================================

        if (
            !credentialRows.length
        ) {

            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .API_CREDENTIAL_REVOKED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .API_CREDENTIAL,

                    entityId:
                        normalizedCredentialId,

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

                        reason:
                            "CREDENTIAL_NOT_FOUND"

                    }

                });

            } catch (auditError) {

                console.error(
                    "API Credential Revoke Audit Error:",
                    auditError
                );

            }


            return {

                success: false,

                statusCode: 404,

                message:
                    "API credential not found."

            };

        }


        const credential =
            credentialRows[0];


        // ==================================================
        // Already Revoked
        // ==================================================

        if (
            credential.status ===
            "REVOKED"
        ) {

            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .API_CREDENTIAL_REVOKED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .API_CREDENTIAL,

                    entityId:
                        normalizedCredentialId,

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
                            credential.merchant_id,

                        environment:
                            credential.environment,

                        reason:
                            "CREDENTIAL_ALREADY_REVOKED",

                        currentStatus:
                            credential.status

                    }

                });

            } catch (auditError) {

                console.error(
                    "API Credential Revoke Audit Error:",
                    auditError
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    "API credential is already revoked."

            };

        }


        // ==================================================
        // Revoke Credential
        // ==================================================

        const [
            result
        ] = await db.query(

            apiCredentialQueries
                .REVOKE_API_CREDENTIAL,

            [
                normalizedCredentialId
            ]

        );


        if (
            result.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to revoke API credential."
            );

        }


        // ==================================================
        // SUCCESS AUDIT
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .API_CREDENTIAL_REVOKED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .API_CREDENTIAL,

            entityId:
                normalizedCredentialId,

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
                    credential.merchant_id,

                environment:
                    credential.environment,

                previousStatus:
                    credential.status,

                newStatus:
                    "REVOKED"

            }

        });


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                "API credential revoked successfully.",

            data: {

                credentialId:
                    normalizedCredentialId,

                status:
                    "REVOKED"

            }

        };


    } catch (error) {

        console.error(
            "Revoke API Credential Error:",
            error
        );


        // ==================================================
        // FAILED AUDIT
        // ==================================================

        try {

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .API_CREDENTIAL_REVOKED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .API_CREDENTIAL,

                entityId:
                    normalizedCredentialId,

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

                    reason:
                        error.code ||
                        "API_CREDENTIAL_REVOKE_FAILED"

                }

            });

        } catch (auditError) {

            console.error(
                "API Credential Failed Audit Error:",
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

    generateApiCredentials,

    getApiCredentials,

    updateApiStatus,

    regenerateApiCredentials,

    revokeApiCredential
};