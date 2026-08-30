const bcrypt = require("bcrypt");
const db = require("../../config/pool");

const {
    createAuditLog
} = require("./audit/audit.service");

const {
    AUDIT_ACTIONS,
    AUDIT_ENTITY_TYPES,
    AUDIT_STATUS
} = require("../../utils/admin/audti.actions");

const sendPasswordChangedAlertEmail = require("../email/sendPasswordChangedAlertEmail");


const changePasswordService = async (
    adminId,
    currentPassword,
    newPassword,
    auditContext = {}
) => {

    const normalizedAdminId =
        Number(adminId);

    const {
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    if (
        !Number.isInteger(normalizedAdminId) ||
        normalizedAdminId <= 0
    ) {
        throw new Error(
            "Invalid admin."
        );
    }


    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        const [rows] =
            await connection.query(
                `
                SELECT
                    admin_id,
                    password_hash,
                    status,
                    token_version
                FROM admins
                WHERE admin_id = ?
                LIMIT 1
                FOR UPDATE
                `,
                [normalizedAdminId]
            );


        if (!rows.length) {

            await createAuditLog({
                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS.ADMIN_PASSWORD_CHANGE_FAILED,

                entityType:
                    AUDIT_ENTITY_TYPES.ADMIN,

                entityId:
                    normalizedAdminId,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,
                userAgent,
                requestId,

                metadata: {
                    reason:
                        "ADMIN_ACCOUNT_NOT_FOUND"
                },

                connection
            });


            await connection.rollback();

            throw new Error(
                "Admin account not found."
            );
        }


        const admin =
            rows[0];


        if (
            admin.status !== "ACTIVE"
        ) {

            await createAuditLog({
                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS.ADMIN_PASSWORD_CHANGE_FAILED,

                entityType:
                    AUDIT_ENTITY_TYPES.ADMIN,

                entityId:
                    normalizedAdminId,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,
                userAgent,
                requestId,

                metadata: {
                    reason:
                        "ADMIN_ACCOUNT_INACTIVE"
                },

                connection
            });


            await connection.rollback();

            throw new Error(
                "Admin account is inactive."
            );
        }


        const passwordValid =
            await bcrypt.compare(
                currentPassword,
                admin.password_hash
            );


        if (!passwordValid) {

            await createAuditLog({
                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS.ADMIN_PASSWORD_CHANGE_FAILED,

                entityType:
                    AUDIT_ENTITY_TYPES.ADMIN,

                entityId:
                    normalizedAdminId,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,
                userAgent,
                requestId,

                metadata: {
                    reason:
                        "CURRENT_PASSWORD_INCORRECT"
                },

                connection
            });


            await connection.rollback();

            throw new Error(
                "Current password is incorrect."
            );
        }


        const samePassword =
            await bcrypt.compare(
                newPassword,
                admin.password_hash
            );


        if (samePassword) {

            await createAuditLog({
                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS.ADMIN_PASSWORD_CHANGE_FAILED,

                entityType:
                    AUDIT_ENTITY_TYPES.ADMIN,

                entityId:
                    normalizedAdminId,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,
                userAgent,
                requestId,

                metadata: {
                    reason:
                        "NEW_PASSWORD_SAME_AS_CURRENT"
                },

                connection
            });


            await connection.rollback();

            throw new Error(
                "New password must be different from the current password."
            );
        }


        const newPasswordHash =
            await bcrypt.hash(
                newPassword,
                12
            );


        const [updateResult] =
            await connection.query(
                `
                UPDATE admins
                SET
                    password_hash = ?,
                    token_version =
                        token_version + 1,
                    last_logout_at = NOW()
                WHERE admin_id = ?
                  AND status = 'ACTIVE'
                `,
                [
                    newPasswordHash,
                    normalizedAdminId
                ]
            );


        if (
            updateResult.affectedRows !== 1
        ) {

            await createAuditLog({
                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS.ADMIN_PASSWORD_CHANGE_FAILED,

                entityType:
                    AUDIT_ENTITY_TYPES.ADMIN,

                entityId:
                    normalizedAdminId,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,
                userAgent,
                requestId,

                metadata: {
                    reason:
                        "PASSWORD_UPDATE_FAILED"
                },

                connection
            });


            await connection.rollback();

            throw new Error(
                "Failed to change password."
            );
        }


        const [
            revokeResult
        ] = await connection.query(
            `
            UPDATE admin_refresh_tokens
            SET revoked = TRUE
            WHERE admin_id = ?
              AND revoked = FALSE
            `,
            [normalizedAdminId]
        );


        const previousTokenVersion =
            Number(admin.token_version);

        const newTokenVersion =
            previousTokenVersion + 1;


        await createAuditLog({
            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS.ADMIN_PASSWORD_CHANGED,

            entityType:
                AUDIT_ENTITY_TYPES.ADMIN,

            entityId:
                normalizedAdminId,

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,
            userAgent,
            requestId,

            metadata: {
                previousTokenVersion,

                newTokenVersion,

                revokedSessions:
                    revokeResult.affectedRows
            },

            connection
        });


        await connection.commit();
        const email = "admin@paymentgateway.com"
        if (admin && admin.email) {
            sendPasswordChangedAlertEmail(
                admin.full_name || "Admin",
                email,
                {
                    time: new Date().toUTCString(),
                    ip: ipAddress || "N/A"
                }
            ).catch((err) => {
                console.error("Failed to send password changed alert email:", err.message);
            });
        }


        return {
            success: true,

            message:
                "Password changed successfully. Please login again."
        };


    } catch (error) {

        try {
            await connection.rollback();
        } catch (_) {
        }

        throw error;

    } finally {

        connection.release();
    }
};


module.exports = {
    changePasswordService
};