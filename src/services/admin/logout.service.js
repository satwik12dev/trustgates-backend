const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const db = require("../../config/pool");

const {
    createAuditLog
} = require("./audit/audit.service");

const {
    AUDIT_ACTIONS,
    AUDIT_ENTITY_TYPES,
    AUDIT_STATUS
} = require("../../utils/admin/audti.actions");


const hashRefreshToken = (refreshToken) => {
    return crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
};


const logoutService = async (
    adminId,
    refreshToken,
    auditContext = {}
) => {

    const normalizedAdminId = Number(adminId);

    if (
        !Number.isInteger(normalizedAdminId) ||
        normalizedAdminId <= 0
    ) {
        throw new Error("Invalid admin.");
    }

    if (
        typeof refreshToken !== "string" ||
        !refreshToken.trim() ||
        refreshToken.length > 4096
    ) {
        throw new Error(
            "Invalid or expired refresh token."
        );
    }

    const {
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;

    const normalizedRefreshToken =
        refreshToken.trim();

    let decoded;

    try {

        decoded = jwt.verify(
            normalizedRefreshToken,
            process.env.JWT_REFRESH_SECRET,
            {
                algorithms: ["HS256"]
            }
        );

    } catch (error) {

        throw new Error(
            "Invalid or expired refresh token."
        );
    }

    if (
        !decoded ||
        decoded.type !== "ADMIN_REFRESH" ||
        Number(decoded.admin_id) !== normalizedAdminId ||
        typeof decoded.token_family_id !== "string" ||
        !decoded.token_family_id.trim() ||
        typeof decoded.session_id !== "string" ||
        !decoded.session_id.trim()
    ) {
        throw new Error(
            "Invalid refresh token."
        );
    }

    const tokenHash =
        hashRefreshToken(
            normalizedRefreshToken
        );

    const connection =
        await db.getConnection();

    try {

        await connection.beginTransaction();

        const [adminRows] =
            await connection.query(
                `
                SELECT
                    admin_id,
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
            throw new Error(
                "Admin account not found."
            );
        }

        if (
            adminRows[0].status !== "ACTIVE"
        ) {
            throw new Error(
                "Admin account is inactive."
            );
        }

        const [tokenRows] =
            await connection.query(
                `
                SELECT
                    token_id,
                    admin_id,
                    session_id,
                    token_hash,
                    expires_at,
                    revoked,
                    token_family_id,
                    replaced_by_token_id
                FROM admin_refresh_tokens
                WHERE token_hash = ?
                  AND admin_id = ?
                  AND session_id = ?
                  AND token_family_id = ?
                LIMIT 1
                FOR UPDATE
                `,
                [
                    tokenHash,
                    normalizedAdminId,
                    decoded.session_id,
                    decoded.token_family_id
                ]
            );

        if (!tokenRows.length) {
            throw new Error(
                "Invalid or expired refresh token."
            );
        }

        const storedToken =
            tokenRows[0];

        if (
            Boolean(storedToken.revoked)
        ) {

            await connection.rollback();

            return {
                success: true,
                message:
                    "Logged out successfully."
            };
        }

        if (
            !storedToken.expires_at ||
            new Date(
                storedToken.expires_at
            ).getTime() <= Date.now()
        ) {

            await connection.rollback();

            return {
                success: true,
                message:
                    "Logged out successfully."
            };
        }

        const [revokeResult] =
            await connection.query(
                `
                UPDATE admin_refresh_tokens
                SET revoked = TRUE
                WHERE
                    token_id = ?
                    AND admin_id = ?
                    AND session_id = ?
                    AND revoked = FALSE
                `,
                [
                    storedToken.token_id,
                    normalizedAdminId,
                    decoded.session_id
                ]
            );

        if (
            revokeResult.affectedRows !== 1
        ) {
            throw new Error(
                "Failed to logout admin session."
            );
        }

        await createAuditLog({
            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS.ADMIN_LOGOUT,

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
                sessionId:
                    decoded.session_id,

                tokenFamilyId:
                    decoded.token_family_id
            },

            connection
        });

        await connection.commit();

        return {
            success: true,
            message:
                "Logged out successfully."
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


const logoutAllAdminSessions = async (
    adminId,
    auditContext = {}
) => {

    const normalizedAdminId =
        Number(adminId);

    if (
        !Number.isInteger(normalizedAdminId) ||
        normalizedAdminId <= 0
    ) {
        throw new Error(
            "Invalid admin."
        );
    }

    const {
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;

    const connection =
        await db.getConnection();

    try {

        await connection.beginTransaction();

        const [adminRows] =
            await connection.query(
                `
                SELECT
                    admin_id,
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
            throw new Error(
                "Admin account not found."
            );
        }

        if (
            adminRows[0].status !== "ACTIVE"
        ) {
            throw new Error(
                "Admin account is inactive."
            );
        }

        const oldTokenVersion =
            Number(
                adminRows[0].token_version
            );

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

        const [
            versionResult
        ] = await connection.query(
            `
            UPDATE admins
            SET
                token_version =
                    token_version + 1,
                last_logout_at = NOW()
            WHERE admin_id = ?
              AND status = 'ACTIVE'
            `,
            [normalizedAdminId]
        );

        if (
            versionResult.affectedRows !== 1
        ) {
            throw new Error(
                "Failed to revoke admin sessions."
            );
        }

        await createAuditLog({
            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS.ADMIN_LOGOUT_ALL,

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
                revokedRefreshTokens:
                    revokeResult.affectedRows,

                previousTokenVersion:
                    oldTokenVersion,

                newTokenVersion:
                    oldTokenVersion + 1
            },

            connection
        });

        await connection.commit();

        return {
            success: true,

            message:
                "All admin sessions have been logged out.",

            revokedSessions:
                revokeResult.affectedRows
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
    logoutService,
    logoutAllAdminSessions
};