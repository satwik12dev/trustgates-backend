const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const db = require("../../config/pool");

const generateAdminToken =
    require("../../utils/generateAdminToken");

const {
    createAuditLog
} = require("./audit/audit.service");

const {
    AUDIT_ACTIONS,
    AUDIT_ENTITY_TYPES,
    AUDIT_STATUS
} = require("../../utils/admin/audti.actions");


const hashRefreshToken = (
    refreshToken
) => {

    return crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
};


const refreshAdminTokenService = async (
    refreshToken,
    auditContext = {}
) => {

    if (
        typeof refreshToken !== "string" ||
        !refreshToken.trim() ||
        refreshToken.length > 4096
    ) {
        throw new Error(
            "Invalid refresh token."
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
        !decoded.admin_id ||
        typeof decoded.token_family_id !== "string" ||
        !decoded.token_family_id.trim() ||
        typeof decoded.session_id !== "string" ||
        !decoded.session_id.trim()
    ) {
        throw new Error(
            "Invalid refresh token."
        );
    }

    const adminId =
        Number(decoded.admin_id);

    if (
        !Number.isInteger(adminId) ||
        adminId <= 0
    ) {
        throw new Error(
            "Invalid refresh token."
        );
    }

    const tokenFamilyId =
        decoded.token_family_id.trim();

    const sessionId =
        decoded.session_id.trim();

    const oldTokenHash =
        hashRefreshToken(
            normalizedRefreshToken
        );

    const connection =
        await db.getConnection();

    try {

        await connection.beginTransaction();

        const [
            adminRows
        ] = await connection.query(
            `
            SELECT
                admin_id,
                full_name,
                email,
                role,
                status,
                token_version
            FROM admins
            WHERE admin_id = ?
            LIMIT 1
            FOR UPDATE
            `,
            [adminId]
        );

        if (!adminRows.length) {

            throw new Error(
                "Admin account not found."
            );
        }

        const admin =
            adminRows[0];

        if (
            admin.status !== "ACTIVE"
        ) {

            throw new Error(
                "Admin account is inactive."
            );
        }

        const [
            tokenRows
        ] = await connection.query(
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
                oldTokenHash,
                adminId,
                sessionId,
                tokenFamilyId
            ]
        );

        if (!tokenRows.length) {

            throw new Error(
                "Invalid refresh token."
            );
        }

        const storedToken =
            tokenRows[0];


        // ==================================================
        // Refresh Token Reuse Detection
        // ==================================================

        if (
            Boolean(storedToken.revoked)
        ) {

            await connection.query(
                `
                UPDATE admin_refresh_tokens
                SET revoked = TRUE
                WHERE admin_id = ?
                  AND token_family_id = ?
                  AND revoked = FALSE
                `,
                [
                    adminId,
                    tokenFamilyId
                ]
            );

            await connection.query(
                `
                UPDATE admins
                SET
                    token_version =
                        token_version + 1,
                    last_logout_at = NOW()
                WHERE admin_id = ?
                `,
                [adminId]
            );

            await createAuditLog({
                adminId,

                action:
                    AUDIT_ACTIONS.ADMIN_LOGIN_FAILED,

                entityType:
                    AUDIT_ENTITY_TYPES.ADMIN,

                entityId:
                    adminId,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,
                userAgent,
                requestId,

                metadata: {
                    reason:
                        "REFRESH_TOKEN_REUSE_DETECTED",

                    sessionId,

                    tokenFamilyId
                },

                connection
            });

            await connection.commit();

            throw new Error(
                "Refresh token reuse detected. All admin sessions have been revoked."
            );
        }


        // ==================================================
        // Refresh Token Expiry
        // ==================================================

        if (
            !storedToken.expires_at ||
            new Date(
                storedToken.expires_at
            ).getTime() <= Date.now()
        ) {

            throw new Error(
                "Refresh token has expired."
            );
        }


        // ==================================================
        // Verify Token Family
        // ==================================================

        if (
            storedToken.token_family_id !==
            tokenFamilyId
        ) {

            throw new Error(
                "Invalid refresh token family."
            );
        }


        // ==================================================
        // Verify Session
        // ==================================================

        if (
            storedToken.session_id !==
            sessionId
        ) {

            throw new Error(
                "Invalid admin session."
            );
        }


        const currentTokenVersion =
            Number(
                admin.token_version
            );

        if (
            !Number.isInteger(
                currentTokenVersion
            ) ||
            currentTokenVersion < 0
        ) {

            throw new Error(
                "Invalid admin token configuration."
            );
        }


        // ==================================================
        // Generate Rotated Tokens
        // ==================================================

        const {
            accessToken,
            refreshToken:
                newRefreshToken
        } = generateAdminToken(
            {
                admin_id:
                    admin.admin_id,

                role:
                    admin.role,

                token_version:
                    currentTokenVersion
            },

            tokenFamilyId,

            sessionId
        );


        const newTokenHash =
            hashRefreshToken(
                newRefreshToken
            );


        const newTokenExpiresAt =
            new Date(
                Date.now() +
                7 * 24 * 60 * 60 * 1000
            );


        // ==================================================
        // Insert New Refresh Token
        // ==================================================

        const [
            insertResult
        ] = await connection.query(
            `
            INSERT INTO admin_refresh_tokens
            (
                admin_id,
                session_id,
                token_hash,
                expires_at,
                revoked,
                token_family_id
            )
            VALUES (?, ?, ?, ?, FALSE, ?)
            `,
            [
                admin.admin_id,
                sessionId,
                newTokenHash,
                newTokenExpiresAt,
                tokenFamilyId
            ]
        );


        if (
            insertResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to create new refresh token."
            );
        }


        const newTokenId =
            insertResult.insertId;


        // ==================================================
        // Revoke Old Token + Link Replacement
        // ==================================================

        const [
            revokeResult
        ] = await connection.query(
            `
            UPDATE admin_refresh_tokens
            SET
                revoked = TRUE,
                replaced_by_token_id = ?
            WHERE token_id = ?
              AND admin_id = ?
              AND session_id = ?
              AND revoked = FALSE
            `,
            [
                newTokenId,
                storedToken.token_id,
                admin.admin_id,
                sessionId
            ]
        );


        if (
            revokeResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to rotate refresh token."
            );
        }


        // ==================================================
        // Audit Refresh
        // ==================================================

        await createAuditLog({
            adminId:
                admin.admin_id,

            action:
                AUDIT_ACTIONS.ADMIN_REFRESH_TOKEN,

            entityType:
                AUDIT_ENTITY_TYPES.ADMIN,

            entityId:
                admin.admin_id,

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,
            userAgent,
            requestId,

            metadata: {
                sessionId,
                tokenFamilyId
            },

            connection
        });


        await connection.commit();


        return {
            accessToken,

            refreshToken:
                newRefreshToken
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
    refreshAdminTokenService
};