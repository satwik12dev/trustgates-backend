const db = require("../../config/pool");

const activateMerchantIfEligible = require(
    "../merchant/activateMerchant.service"
);

const {
    createAuditLog
} = require("./audit/audit.service");

const {
    AUDIT_ACTIONS,
    AUDIT_ENTITY_TYPES,
    AUDIT_STATUS
} = require("../../utils/admin/audti.actions");


// ==========================================================
// Verify / Reject / Cancel KYC
// ==========================================================

const verifyKycService = async (
    merchantId,
    adminId,
    action,
    verificationNotes,
    auditContext = {}
) => {

    const connection =
        await db.getConnection();

    let merchant = null;
    let kycStatus = null;
    let activation = null;
    let kycId = null;

    try {

        // ==================================================
        // Validate Admin
        // ==================================================

        const normalizedAdminId =
            Number(adminId);

        if (
            !Number.isInteger(normalizedAdminId) ||
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
        // Validate Merchant
        // ==================================================

        const normalizedMerchantId =
            Number(merchantId);

        if (
            !Number.isInteger(normalizedMerchantId) ||
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
        // Validate Action
        // ==================================================

        if (
            ![
                "APPROVED",
                "REJECTED",
                "CANCELLED"
            ].includes(action)
        ) {

            return {
                success: false,
                statusCode: 400,
                message:
                    "Invalid KYC action."
            };

        }


        await connection.beginTransaction();


        // ==================================================
        // Check KYC Record + Lock
        // ==================================================

        const [
            kycRows
        ] = await connection.query(

            `
            SELECT
                kyc_id,
                merchant_id,
                kyc_status
            FROM merchant_kyc
            WHERE merchant_id = ?
            LIMIT 1
            FOR UPDATE
            `,

            [
                normalizedMerchantId
            ]

        );


        if (
            !kycRows.length
        ) {

            await connection.rollback();

            return {
                success: false,
                statusCode: 404,
                message:
                    "KYC record not found."
            };

        }


        const kyc =
            kycRows[0];

        kycId =
            kyc.kyc_id;


        // ==================================================
        // Prevent Duplicate Processing
        // ==================================================

        if (
            kyc.kyc_status !==
            "PENDING"
        ) {

            await connection.rollback();

            return {
                success: false,
                statusCode: 409,
                message:
                    `KYC has already been ${kyc.kyc_status.toLowerCase()}.`
            };

        }


        // ==================================================
        // Get Merchant + Lock
        // ==================================================

        const [
            merchantRows
        ] = await connection.query(

            `
            SELECT
                merchant_id,
                merchant_name,
                email,
                email_verified,
                kyc_status,
                account_status
            FROM merchants
            WHERE merchant_id = ?
            LIMIT 1
            FOR UPDATE
            `,

            [
                normalizedMerchantId
            ]

        );


        if (
            !merchantRows.length
        ) {

            await connection.rollback();

            return {
                success: false,
                statusCode: 404,
                message:
                    "Merchant not found."
            };

        }


        merchant =
            merchantRows[0];


        // ==================================================
        // Decide KYC Status
        // ==================================================

        kycStatus =
            action;


        // ==================================================
        // Update merchant_kyc
        // ==================================================

        const [
            kycUpdateResult
        ] = await connection.query(

            `
            UPDATE merchant_kyc
            SET
                kyc_status = ?,
                verification_notes = ?,
                verified_by = ?,
                verified_at = NOW(),
                updated_at = CURRENT_TIMESTAMP
            WHERE merchant_id = ?
              AND kyc_status = 'PENDING'
            `,

            [
                kycStatus,
                verificationNotes || null,
                normalizedAdminId,
                normalizedMerchantId
            ]

        );


        if (
            kycUpdateResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to update merchant KYC."
            );

        }


        // ==================================================
        // KYC REJECTED
        // ==================================================

        if (
            kycStatus ===
            "REJECTED"
        ) {

            const [
                merchantUpdateResult
            ] = await connection.query(

                `
                UPDATE merchants
                SET
                    kyc_status = 'REJECTED',
                    account_status = 'HOLD',
                    updated_at = CURRENT_TIMESTAMP
                WHERE merchant_id = ?
                `,

                [
                    normalizedMerchantId
                ]

            );


            if (
                merchantUpdateResult.affectedRows !== 1
            ) {

                throw new Error(
                    "Failed to update merchant KYC status."
                );

            }


            // ==================================================
            // Audit — KYC REJECTED
            // ==================================================

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS.KYC_REJECTED,

                entityType:
                    AUDIT_ENTITY_TYPES.KYC,

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

                    merchantName:
                        merchant.merchant_name,

                    previousStatus:
                        "PENDING",

                    newStatus:
                        "REJECTED",

                    accountStatus:
                        "HOLD",

                    verificationNotes:
                        verificationNotes
                            ? String(
                                verificationNotes
                            ).slice(
                                0,
                                1000
                            )
                            : null

                },

                connection

            });


            await connection.commit();


            return {

                success: true,

                status: "REJECTED",

                merchant: {

                    merchant_id:
                        merchant.merchant_id,

                    merchant_name:
                        merchant.merchant_name,

                    email:
                        merchant.email

                },

                emailVerified:
                    Boolean(
                        merchant.email_verified
                    ),

                accountStatus:
                    "HOLD",

                activated:
                    false,

                wallet:
                    null,

                apiCredentials:
                    null

            };

        }


        // ==================================================
        // KYC CANCELLED
        // ==================================================

        if (
            kycStatus ===
            "CANCELLED"
        ) {

            const [
                merchantUpdateResult
            ] = await connection.query(

                `
                UPDATE merchants
                SET
                    kyc_status = 'CANCELLED',
                    account_status = 'HOLD',
                    updated_at = CURRENT_TIMESTAMP
                WHERE merchant_id = ?
                `,

                [
                    normalizedMerchantId
                ]

            );


            if (
                merchantUpdateResult.affectedRows !== 1
            ) {

                throw new Error(
                    "Failed to update merchant KYC status."
                );

            }


            // ==================================================
            // Audit — KYC CANCELLED
            // ==================================================

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS.KYC_CANCELLED,

                entityType:
                    AUDIT_ENTITY_TYPES.KYC,

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

                    merchantName:
                        merchant.merchant_name,

                    previousStatus:
                        "PENDING",

                    newStatus:
                        "CANCELLED",

                    accountStatus:
                        "HOLD",

                    cancellationNotes:
                        verificationNotes
                            ? String(
                                verificationNotes
                            ).slice(
                                0,
                                1000
                            )
                            : null

                },

                connection

            });


            await connection.commit();


            return {

                success: true,

                status: "CANCELLED",

                merchant: {

                    merchant_id:
                        merchant.merchant_id,

                    merchant_name:
                        merchant.merchant_name,

                    email:
                        merchant.email

                },

                emailVerified:
                    Boolean(
                        merchant.email_verified
                    ),

                accountStatus:
                    "HOLD",

                activated:
                    false,

                wallet:
                    null,

                apiCredentials:
                    null

            };

        }


        // ==================================================
        // KYC APPROVED
        // ==================================================

        const [
            merchantKycUpdateResult
        ] = await connection.query(

            `
            UPDATE merchants
            SET
                kyc_status = 'APPROVED',
                updated_at = CURRENT_TIMESTAMP
            WHERE merchant_id = ?
            `,

            [
                normalizedMerchantId
            ]

        );


        if (
            merchantKycUpdateResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to synchronize merchant KYC status."
            );

        }


        // ==================================================
        // Try Merchant Activation
        // ==================================================

        activation =
            await activateMerchantIfEligible(

                connection,

                normalizedMerchantId

            );


        // ==================================================
        // Audit — KYC APPROVED
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS.KYC_APPROVED,

            entityType:
                AUDIT_ENTITY_TYPES.KYC,

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

                merchantName:
                    merchant.merchant_name,

                previousStatus:
                    "PENDING",

                newStatus:
                    "APPROVED",

                emailVerified:
                    Boolean(
                        merchant.email_verified
                    ),

                activated:
                    Boolean(
                        activation?.activated
                    ),

                walletCreated:
                    Boolean(
                        activation?.walletCreated
                    ),

                apiCredentialsCreated:
                    Boolean(
                        activation?.apiCredentialsCreated
                    )

            },

            connection

        });


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Return Result
        // ==================================================

        return {

            success: true,

            status: "APPROVED",

            merchant: {

                merchant_id:
                    merchant.merchant_id,

                merchant_name:
                    merchant.merchant_name,

                email:
                    merchant.email

            },

            emailVerified:
                Boolean(
                    merchant.email_verified
                ),

            accountStatus:
                activation?.activated
                    ? "ACTIVE"
                    : "PENDING",

            activated:
                Boolean(
                    activation?.activated
                ),

            wallet:
                activation?.wallet ||
                null,

            apiCredentials:
                activation?.apiCredentials ||
                null

        };


    } catch (error) {

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "KYC ROLLBACK ERROR:",
                rollbackError
            );

        }


        // ==================================================
        // Failed Audit
        // ==================================================

        try {

            const failedAction =
                action === "APPROVED"
                    ? AUDIT_ACTIONS.KYC_APPROVED
                    : action === "REJECTED"
                        ? AUDIT_ACTIONS.KYC_REJECTED
                        : action === "CANCELLED"
                            ? AUDIT_ACTIONS.KYC_CANCELLED
                            : AUDIT_ACTIONS.KYC_VERIFICATION_FAILED;


            await createAuditLog({

                adminId:
                    Number(adminId) || null,

                action:
                    failedAction,

                entityType:
                    AUDIT_ENTITY_TYPES.KYC,

                entityId:
                    kycId || null,

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

                    requestedAction:
                        action || null,

                    reason:
                        error.code ||
                        error.message ||
                        "KYC_VERIFICATION_FAILED"

                }

            });

        } catch (auditError) {

            console.error(
                "KYC Verification Failed Audit Error:",
                auditError
            );

        }


        throw error;

    } finally {

        connection.release();

    }

};


// ==========================================================
// Export
// ==========================================================

module.exports = {
    verifyKycService
};