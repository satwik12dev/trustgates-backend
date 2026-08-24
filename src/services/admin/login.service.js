const argon2 = require("argon2");
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


// ==========================================================
// Argon2 Configuration
// ==========================================================

const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
};


// ==========================================================
// Admin Login Service
// ==========================================================

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


    // ======================================================
    // Validate Input
    // ======================================================

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


    // ======================================================
    // Find Admin
    // ======================================================

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

            [
                normalizedEmail
            ]

        );


    // ======================================================
    // Admin Not Found
    // ======================================================

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


    const admin =
        rows[0];


    // ======================================================
    // Account Status
    // ======================================================

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


    // ======================================================
    // Password Verification
    // ======================================================

    const passwordHash =
        admin.password_hash || "";

    let isPasswordValid = false;

    let isBcryptPassword = false;


    // ======================================================
    // Argon2id
    // ======================================================

    if (
        passwordHash.startsWith("$argon2id$")
    ) {

        isPasswordValid =
            await argon2.verify(
                passwordHash,
                password
            );

    }


    // ======================================================
    // Legacy bcrypt
    // ======================================================

    else if (
        passwordHash.startsWith("$2a$") ||
        passwordHash.startsWith("$2b$") ||
        passwordHash.startsWith("$2y$")
    ) {

        isBcryptPassword = true;

        isPasswordValid =
            await bcrypt.compare(
                password,
                passwordHash
            );

    }


    // ======================================================
    // Invalid Password
    // ======================================================

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


    // ======================================================
    // bcrypt → Argon2id Migration
    // ======================================================
    //
    // Migration intentionally retained.
    //
    // Existing bcrypt admin accounts are migrated
    // after successful authentication.
    //
    // ======================================================

    if (isBcryptPassword) {

        const newPasswordHash =
            await argon2.hash(
                password,
                ARGON2_OPTIONS
            );


        await db.query(

            `
            UPDATE admins

            SET password_hash = ?

            WHERE admin_id = ?
            `,

            [
                newPasswordHash,
                admin.admin_id
            ]

        );

    }


    // ======================================================
    // Token Version Validation
    // ======================================================

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


    // ======================================================
    // Database Connection
    // ======================================================

    const connection =
        await db.getConnection();


    try {

        // ==================================================
        // Start Transaction
        // ==================================================

        await connection.beginTransaction();


        // ==================================================
        // Lock Admin Row
        // ==================================================

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

                [
                    admin.admin_id
                ]

            );


        if (!adminLockRows.length) {

            throw new Error(
                "Admin account not found."
            );
        }


        const lockedAdmin =
            adminLockRows[0];


        // ==================================================
        // Re-check Account Status
        // ==================================================

        if (
            lockedAdmin.status !== "ACTIVE"
        ) {

            throw new Error(
                "Your account is inactive."
            );
        }


        // ==================================================
        // Re-check Token Version
        // ==================================================

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


        // ==================================================
        // Token Family
        // ==================================================

        const tokenFamilyId =
            crypto.randomUUID();


        // ==================================================
        // Generate Tokens
        // ==================================================

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


        // ==================================================
        // Hash Refresh Token
        // ==================================================

        const refreshTokenHash =
            crypto
                .createHash("sha256")
                .update(refreshToken)
                .digest("hex");


        // ==================================================
        // Refresh Token Expiry
        // ==================================================

        const expiresAt =
            new Date(

                Date.now() +
                7 * 24 * 60 * 60 * 1000

            );


        // ==================================================
        // Store Refresh Token
        // ==================================================

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

            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                FALSE,
                ?
            )
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


        // ==================================================
        // Update Last Login
        // ==================================================

        await connection.query(

            `
            UPDATE admins

            SET last_login_at = NOW()

            WHERE admin_id = ?
            `,

            [
                lockedAdmin.admin_id
            ]

        );


        // ==================================================
        // Audit Log
        // ==================================================

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


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Return
        // ==================================================

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