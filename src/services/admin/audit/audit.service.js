const db = require("../../../config/pool");

const SENSITIVE_KEYS = new Set([
    "password",
    "password_hash",
    "currentpassword",
    "newpassword",
    "confirmpassword",

    "accesstoken",
    "access_token",
    "refreshtoken",
    "refresh_token",
    "token",
    "authorization",

    "secretkey",
    "secret_key",
    "secretkeyhash",
    "secret_key_hash",

    "apisecret",
    "api_secret",
    "apikey",
    "api_key",

    "privatekey",
    "private_key",

    "pan",
    "pan_number",
    "aadhaar",
    "aadhaar_number",

    "pandocument",
    "pan_document",
    "aadhaardocument",
    "aadhaar_document",

    "otp",
    "verificationcode",
    "verification_code"
]);

const ALLOWED_STATUS = new Set([
    "SUCCESS",
    "FAILED"
]);

const MAX_METADATA_DEPTH = 8;
const MAX_STRING_LENGTH = 2000;
const MAX_ARRAY_ITEMS = 100;
const MAX_OBJECT_KEYS = 100;


const sanitizeMetadata = (
    metadata,
    depth = 0
) => {

    if (
        metadata === null ||
        metadata === undefined
    ) {
        return null;
    }

    if (
        depth > MAX_METADATA_DEPTH
    ) {
        return "[TRUNCATED]";
    }

    if (
        typeof metadata === "string"
    ) {
        return metadata.length > MAX_STRING_LENGTH
            ? metadata.substring(
                0,
                MAX_STRING_LENGTH
            )
            : metadata;
    }

    if (
        typeof metadata === "number" ||
        typeof metadata === "boolean"
    ) {
        return metadata;
    }

    if (
        typeof metadata !== "object"
    ) {
        return null;
    }

    if (Array.isArray(metadata)) {

        return metadata
            .slice(0, MAX_ARRAY_ITEMS)
            .map(item =>
                sanitizeMetadata(
                    item,
                    depth + 1
                )
            );
    }

    const result = {};

    const entries =
        Object.entries(metadata)
            .slice(
                0,
                MAX_OBJECT_KEYS
            );

    for (
        const [key, value]
        of entries
    ) {

        const normalizedKey =
            String(key)
                .trim()
                .toLowerCase();

        if (
            SENSITIVE_KEYS.has(
                normalizedKey
            )
        ) {
            continue;
        }

        result[key] =
            sanitizeMetadata(
                value,
                depth + 1
            );
    }

    return result;
};


const normalizeIpAddress = (
    ipAddress
) => {

    if (
        typeof ipAddress !== "string" ||
        !ipAddress.trim()
    ) {
        return null;
    }

    let ip =
        ipAddress.trim();

    if (
        ip.startsWith("::ffff:")
    ) {
        ip =
            ip.substring(7);
    }

    return ip.substring(0, 45);
};


const normalizeUserAgent = (
    userAgent
) => {

    if (
        typeof userAgent !== "string" ||
        !userAgent.trim()
    ) {
        return null;
    }

    return userAgent
        .trim()
        .substring(0, 500);
};


const normalizeRequestId = (
    requestId
) => {

    if (
        typeof requestId !== "string" ||
        !requestId.trim()
    ) {
        return null;
    }

    return requestId
        .trim()
        .substring(0, 100);
};


const createAuditLog = async ({
    adminId = null,
    action,
    entityType = null,
    entityId = null,
    status = "SUCCESS",
    ipAddress = null,
    userAgent = null,
    requestId = null,
    metadata = null,
    connection = null
}) => {

    if (
        typeof action !== "string" ||
        !action.trim()
    ) {
        throw new Error(
            "Audit action is required."
        );
    }

    const normalizedStatus =
        String(status)
            .trim()
            .toUpperCase();

    if (
        !ALLOWED_STATUS.has(
            normalizedStatus
        )
    ) {
        throw new Error(
            "Invalid audit status."
        );
    }

    let normalizedAdminId = null;

    if (
        adminId !== null &&
        adminId !== undefined
    ) {

        normalizedAdminId =
            Number(adminId);

        if (
            !Number.isInteger(
                normalizedAdminId
            ) ||
            normalizedAdminId <= 0
        ) {
            throw new Error(
                "Invalid audit admin ID."
            );
        }
    }

    const normalizedAction =
        action
            .trim()
            .toUpperCase()
            .substring(0, 100);

    const normalizedEntityType =
        entityType !== null &&
        entityType !== undefined
            ? String(entityType)
                .trim()
                .toUpperCase()
                .substring(0, 50)
            : null;

    const normalizedEntityId =
        entityId !== null &&
        entityId !== undefined
            ? String(entityId)
                .substring(0, 100)
            : null;

    const normalizedIp =
        normalizeIpAddress(
            ipAddress
        );

    const normalizedUserAgent =
        normalizeUserAgent(
            userAgent
        );

    const normalizedRequestId =
        normalizeRequestId(
            requestId
        );

    const sanitizedMetadata =
        sanitizeMetadata(metadata);

    const metadataJson =
        sanitizedMetadata !== null
            ? JSON.stringify(
                sanitizedMetadata
            )
            : null;

    const query = `
        INSERT INTO audit_logs
        (
            admin_id,
            action,
            entity_type,
            entity_id,
            status,
            ip_address,
            user_agent,
            request_id,
            metadata
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        normalizedAdminId,
        normalizedAction,
        normalizedEntityType,
        normalizedEntityId,
        normalizedStatus,
        normalizedIp,
        normalizedUserAgent,
        normalizedRequestId,
        metadataJson
    ];

    const executor =
        connection || db;

    const [
        result
    ] = await executor.query(
        query,
        values
    );

    return {
        auditId:
            result.insertId
    };
};


module.exports = {
    createAuditLog,
    sanitizeMetadata
};