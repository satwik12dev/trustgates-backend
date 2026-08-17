const bcrypt = require("bcrypt");
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


const loginService = async (
    email,
    password,
    auditContext = {}
) => {

    const normalizedEmail =
        typeof email === "string"
            ? email.trim().toLowerCase()
            : "";

    const {
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    if (
        !normalizedEmail ||
        typeof password !== "string" ||
        !password
    ) {

        await createAuditLog({
            adminId: null,

            action:
                AUDIT_ACTIONS.ADMIN_LOGIN_FAILED,

            entityType:
                AUDIT_ENTITY_TYPES.ADMIN,

            status:
                AUDIT_STATUS.FAILED,

            ipAddress,
            userAgent,
            requestId,

            metadata: {
                reason:
                    "INVALID_LOGIN_INPUT"
            }
        });

        throw new Error(
            "Invalid email or password."
        );
    }


    const [rows] =
        await db.query(
            `
            SELECT
                admin_id,
                full_name,
                email,
                password_hash,
                role,
                status,
                token_version
            FROM admins
            WHERE email = ?
            LIMIT 1
            `,
            [normalizedEmail]
        );


    if (!rows.length) {

        await createAuditLog({
            adminId: null,

            action:
                AUDIT_ACTIONS.ADMIN_LOGIN_FAILED,

            entityType:
                AUDIT_ENTITY_TYPES.ADMIN,

            status:
                AUDIT_STATUS.FAILED,

            ipAddress,
            userAgent,
            requestId,

            metadata: {
                reason:
                    "INVALID_EMAIL_OR_PASSWORD"
            }
        });

        throw new Error(
            "Invalid email or password."
        );
    }


    const admin = rows[0];


    if (
        admin.status !== "ACTIVE"
    ) {

        await createAuditLog({
            adminId:
                admin.admin_id,

            action:
                AUDIT_ACTIONS.ADMIN_LOGIN_FAILED,

            entityType:
                AUDIT_ENTITY_TYPES.ADMIN,

            entityId:
                admin.admin_id,

            status:
                AUDIT_STATUS.FAILED,

            ipAddress,
            userAgent,
            requestId,

            metadata: {
                reason:
                    "ADMIN_ACCOUNT_INACTIVE"
            }
        });

        throw new Error(
            "Your account is inactive."
        );
    }


    const isPasswordValid =
        await bcrypt.compare(
            password,
            admin.password_hash
        );


    if (!isPasswordValid) {

        await createAuditLog({
            adminId:
                admin.admin_id,

            action:
                AUDIT_ACTIONS.ADMIN_LOGIN_FAILED,

            entityType:
                AUDIT_ENTITY_TYPES.ADMIN,

            entityId:
                admin.admin_id,

            status:
                AUDIT_STATUS.FAILED,

            ipAddress,
            userAgent,
            requestId,

            metadata: {
                reason:
                    "INVALID_EMAIL_OR_PASSWORD"
            }
        });

        throw new Error(
            "Invalid email or password."
        );
    }


    const tokenVersion =
        Number(
            admin.token_version
        );


    if (
        !Number.isInteger(tokenVersion) ||
        tokenVersion < 0
    ) {

        await createAuditLog({
            adminId:
                admin.admin_id,

            action:
                AUDIT_ACTIONS.ADMIN_LOGIN_FAILED,

            entityType:
                AUDIT_ENTITY_TYPES.ADMIN,

            entityId:
                admin.admin_id,

            status:
                AUDIT_STATUS.FAILED,

            ipAddress,
            userAgent,
            requestId,

            metadata: {
                reason:
                    "INVALID_TOKEN_CONFIGURATION"
            }
        });

        throw new Error(
            "Invalid admin token configuration."
        );
    }


    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        const [adminLockRows] =
            await connection.query(
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
                [admin.admin_id]
            );


        if (!adminLockRows.length) {

            throw new Error(
                "Admin account not found."
            );
        }


        const lockedAdmin =
            adminLockRows[0];


        if (
            lockedAdmin.status !== "ACTIVE"
        ) {

            throw new Error(
                "Your account is inactive."
            );
        }


        const currentTokenVersion =
            Number(
                lockedAdmin.token_version
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


        const tokenFamilyId =
            crypto.randomUUID();


        const {
            accessToken,
            refreshToken,
            sessionId
        } = generateAdminToken(
            {
                admin_id:
                    lockedAdmin.admin_id,

                role:
                    lockedAdmin.role,

                token_version:
                    currentTokenVersion
            },
            tokenFamilyId
        );


        const refreshTokenHash =
            crypto
                .createHash("sha256")
                .update(refreshToken)
                .digest("hex");


        const expiresAt =
            new Date(
                Date.now() +
                7 * 24 * 60 * 60 * 1000
            );


        const [
            refreshInsertResult
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
                lockedAdmin.admin_id,
                sessionId,
                refreshTokenHash,
                expiresAt,
                tokenFamilyId
            ]
        );


        if (
            refreshInsertResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to create admin session."
            );
        }


        await connection.query(
            `
            UPDATE admins
            SET last_login_at = NOW()
            WHERE admin_id = ?
            `,
            [lockedAdmin.admin_id]
        );


        await createAuditLog({
            adminId:
                lockedAdmin.admin_id,

            action:
                AUDIT_ACTIONS.ADMIN_LOGIN,

            entityType:
                AUDIT_ENTITY_TYPES.ADMIN,

            entityId:
                lockedAdmin.admin_id,

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,
            userAgent,
            requestId,

            metadata: {
                role:
                    lockedAdmin.role,

                tokenVersion:
                    currentTokenVersion,

                sessionId
            },

            connection
        });


        await connection.commit();


        return {

            accessToken,

            refreshToken,

            admin: {
                admin_id:
                    lockedAdmin.admin_id,

                full_name:
                    lockedAdmin.full_name,

                email:
                    lockedAdmin.email,

                role:
                    lockedAdmin.role
            }
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
    loginService
};