const bcrypt = require("bcrypt");

const db = require("../../../config/pool");
const redis = require("../../../config/redis");

const {
    hashResetToken
} = require("./verifyForgotPasswordOtp.service");

const {
    createAuditLog
} = require("../audit/audit.service");

const {
    AUDIT_ACTIONS,
    AUDIT_ENTITY_TYPES,
    AUDIT_STATUS
} = require("../../../utils/admin/audti.actions");


const resetPasswordService = async (
    resetToken,
    newPassword,
    auditContext = {}
) => {

    const {
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    if (
        typeof resetToken !== "string" ||
        !resetToken.trim()
    ) {

        throw new Error(
            "Invalid reset token."
        );
    }


    const tokenHash =
        hashResetToken(
            resetToken.trim()
        );


    const resetKey =
        `admin:forgot-password:reset:${tokenHash}`;


    const resetRaw =
        await redis.get(
            resetKey
        );


    if (!resetRaw) {

        throw new Error(
            "Invalid or expired reset token."
        );
    }


    let resetData;


    try {

        resetData =
            JSON.parse(
                resetRaw
            );

    } catch (_) {

        await redis.del(
            resetKey
        );

        throw new Error(
            "Invalid reset token."
        );
    }


    const normalizedAdminId =
        Number(
            resetData.adminId
        );


    if (
        !Number.isInteger(
            normalizedAdminId
        ) ||
        normalizedAdminId <= 0
    ) {

        await redis.del(
            resetKey
        );

        throw new Error(
            "Invalid reset token."
        );
    }


    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        const [adminRows] =
            await connection.query(
                `
                SELECT
                    admin_id,
                    email,
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


        if (!adminRows.length) {

            await connection.rollback();

            await redis.del(
                resetKey
            );

            throw new Error(
                "Admin account not found."
            );
        }


        const admin =
            adminRows[0];


        if (
            admin.status !== "ACTIVE"
        ) {

            await connection.rollback();

            await redis.del(
                resetKey
            );

            throw new Error(
                "Admin account is inactive."
            );
        }


        const samePassword =
            await bcrypt.compare(
                newPassword,
                admin.password_hash
            );


        if (samePassword) {

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


        const previousTokenVersion =
            Number(
                admin.token_version
            );


        const newTokenVersion =
            previousTokenVersion + 1;


        const [updateResult] =
            await connection.query(
                `
                UPDATE admins
                SET
                    password_hash = ?,
                    token_version = ?,
                    last_logout_at = NOW()
                WHERE admin_id = ?
                  AND status = 'ACTIVE'
                `,
                [
                    newPasswordHash,
                    newTokenVersion,
                    normalizedAdminId
                ]
            );


        if (
            updateResult.affectedRows !== 1
        ) {

            await connection.rollback();

            throw new Error(
                "Failed to reset password."
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


        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS.ADMIN_PASSWORD_RESET,

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
                    revokeResult.affectedRows,

                method:
                    "FORGOT_PASSWORD_OTP"
            },

            connection
        });


        await connection.commit();


        await redis.del(
            resetKey
        );


        return {

            success: true,

            message:
                "Password reset successfully. Please login again."
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
    resetPasswordService
};