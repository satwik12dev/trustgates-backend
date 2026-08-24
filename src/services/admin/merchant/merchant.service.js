const argon2 = require("argon2");
const crypto = require("crypto");
const net = require("net");

const db = require("../../../config/pool");

const merchantQueries = require(
    "../../../queries/admin/merchant/merchant.query"
);

const activateMerchantIfEligible = require(
    "../../../services/merchant/activateMerchant.service"
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
// CONFIGURATION
// ==========================================================
const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
};

const MAX_PAGE_SIZE = 100;

const MAX_SEARCH_LENGTH = 100;

const MAX_VERIFICATION_NOTES_LENGTH = 1000;

const MAX_IP_WHITELIST = 50;


// ==========================================================
// HELPERS
// ==========================================================

const normalizeEmail = (email) => {

    return String(email)
        .trim()
        .toLowerCase();

};


const normalizeString = (value) => {

    if (
        value === undefined ||
        value === null
    ) {
        return null;
    }

    const valueString =
        String(value).trim();

    return valueString === ""
        ? null
        : valueString;

};


const isValidMerchantId = (merchantId) => {

    return (
        Number.isInteger(
            Number(merchantId)
        ) &&
        Number(merchantId) > 0
    );

};


const isDuplicateKey = (
    error,
    keyName
) => {

    return (
        error?.code === "ER_DUP_ENTRY" &&
        String(error?.sqlMessage || "")
            .toLowerCase()
            .includes(
                String(keyName).toLowerCase()
            )
    );

};


const safeRollback = async (
    connection
) => {

    try {

        await connection.rollback();

    } catch (error) {

        console.error(
            "Transaction rollback error:",
            error.message
        );

    }

};

// ==========================================================
// CREATE MERCHANT
// ==========================================================

const createMerchant = async (
    merchantData,
    auditContext = {}
) => {

    const connection =
        await db.getConnection();

    const {
        adminId = null,
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;

    try {

        // ==================================================
        // Admin Validation
        // ==================================================

        if (
            !adminId ||
            !Number.isInteger(
                Number(adminId)
            ) ||
            Number(adminId) <= 0
        ) {

            return {
                success: false,
                statusCode: 401,
                message:
                    "Valid admin authentication is required."
            };
        }

        const normalizedAdminId =
            Number(adminId);


        // ==================================================
        // Request Data
        // ==================================================

        const {
            businessName,
            merchantName,
            email,
            phone,
            website,
            password
        } = merchantData;


        // ==================================================
        // Normalize
        // ==================================================

        const normalizedBusinessName =
            String(
                businessName
            ).trim();

        const normalizedMerchantName =
            String(
                merchantName
            ).trim();

        const normalizedEmail =
            normalizeEmail(
                email
            );

        const normalizedPhone =
            String(
                phone
            ).trim();

        const normalizedWebsite =
            normalizeString(
                website
            );


        // ==================================================
        // Start Transaction
        // ==================================================

        await connection.beginTransaction();


        // ==================================================
        // Check Duplicate Email
        // ==================================================

        const [
            existingMerchant
        ] = await connection.query(

            merchantQueries
                .CHECK_EMAIL_EXISTS,

            [
                normalizedEmail
            ]
        );


        if (
            existingMerchant.length
        ) {

            await safeRollback(
                connection
            );

            // ----------------------------------------------
            // Failed Audit
            // ----------------------------------------------

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS.MERCHANT_CREATED,

                entityType:
                    AUDIT_ENTITY_TYPES.MERCHANT,

                entityId:
                    null,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,

                userAgent,

                requestId,

                metadata: {

                    reason:
                        "EMAIL_ALREADY_REGISTERED",

                    email:
                        normalizedEmail

                }

            });

            return {

                success: false,

                statusCode: 409,

                message:
                    "Email already registered."

            };
        }


        // ==================================================
        // Generate Merchant Code Sequence
        // ==================================================
        //
        // Example:
        //
        // sequence_id = 1  → MER-001
        // sequence_id = 2  → MER-002
        // sequence_id = 15 → MER-015
        //
        // ==================================================

        const [
            sequenceResult
        ] = await connection.query(

            merchantQueries
                .CREATE_MERCHANT_CODE_SEQUENCE

        );


        if (
            !sequenceResult ||
            !sequenceResult.insertId
        ) {

            throw new Error(
                "Failed to generate merchant code."
            );
        }


        const merchantSequenceId =
            sequenceResult.insertId;


        const merchantCode =
            `MER-${String(
                merchantSequenceId
            ).padStart(3, "0")}`;


        // ==================================================
        // Hash Password
        // ==================================================

        const passwordHash =
            await argon2.hash(
                password,
                ARGON2_OPTIONS
            );


        // ==================================================
        // Create Merchant
        // ==================================================

        let merchantResult;


        try {

            const [
                result
            ] = await connection.query(

                merchantQueries
                    .CREATE_MERCHANT,

                [

                    merchantCode,

                    normalizedBusinessName,

                    normalizedMerchantName,

                    normalizedEmail,

                    normalizedPhone,

                    normalizedWebsite,

                    passwordHash

                ]

            );


            merchantResult =
                result;

        } catch (error) {

            // ==================================================
            // Concurrent Duplicate Email Protection
            // ==================================================

            if (
                isDuplicateKey(
                    error,
                    "email"
                )
            ) {

                await safeRollback(
                    connection
                );


                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS.MERCHANT_CREATED,

                    entityType:
                        AUDIT_ENTITY_TYPES.MERCHANT,

                    entityId:
                        null,

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "EMAIL_ALREADY_REGISTERED",

                        email:
                            normalizedEmail

                    }

                });


                return {

                    success: false,

                    statusCode: 409,

                    message:
                        "Email already registered."

                };
            }


            throw error;
        }


        // ==================================================
        // Verify Insert
        // ==================================================

        if (
            !merchantResult ||
            merchantResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to create merchant."
            );
        }


        const merchantId =
            merchantResult.insertId;


        // ==================================================
        // AUDIT LOG
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS.MERCHANT_CREATED,

            entityType:
                AUDIT_ENTITY_TYPES.MERCHANT,

            entityId:
                merchantId,

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,

            userAgent,

            requestId,

            metadata: {

                merchantCode,

                businessName:
                    normalizedBusinessName,

                merchantName:
                    normalizedMerchantName,

                email:
                    normalizedEmail,

                phone:
                    normalizedPhone,

                website:
                    normalizedWebsite,

                initialStatus: {

                    approvalStatus:
                        "PENDING",

                    kycStatus:
                        "PENDING",

                    accountStatus:
                        "HOLD"

                }

            },

            connection

        });


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 201,

            message:
                "Merchant created successfully. Email verification, KYC verification and admin approval are required before activation.",

            data: {

                merchantId,

                merchantCode,

                businessName:
                    normalizedBusinessName,

                merchantName:
                    normalizedMerchantName,

                email:
                    normalizedEmail,

                phone:
                    normalizedPhone,

                website:
                    normalizedWebsite,

                emailVerified:
                    false,

                approvalStatus:
                    "PENDING",

                kycStatus:
                    "PENDING",

                accountStatus:
                    "HOLD"

            }

        };


    } catch (error) {

        await safeRollback(
            connection
        );

        console.error(
            "Create Merchant Error:",
            error
        );

        throw error;

    } finally {

        connection.release();

    }
};


// ==========================================================
// GET MERCHANT LIST
// ==========================================================

const getMerchantList = async (
    queryParams = {},
    auditContext = {}
) => {

    try {

        const {
            adminId = null,
            ipAddress = null,
            userAgent = null,
            requestId = null
        } = auditContext;


        // ==================================================
        // Validate Admin
        // ==================================================

        if (
            !adminId ||
            !Number.isInteger(
                Number(adminId)
            ) ||
            Number(adminId) <= 0
        ) {

            throw new Error(
                "Invalid admin authentication."
            );

        }


        const normalizedAdminId =
            Number(adminId);


        // ==================================================
        // Pagination
        // ==================================================

        let page =
            Number(
                queryParams.page || 1
            );

        let limit =
            Number(
                queryParams.limit || 10
            );

        let search =
            queryParams.search || "";


        if (
            !Number.isInteger(page) ||
            page < 1
        ) {

            page = 1;

        }


        if (
            !Number.isInteger(limit) ||
            limit < 1
        ) {

            limit = 10;

        }


        if (
            limit > MAX_PAGE_SIZE
        ) {

            limit =
                MAX_PAGE_SIZE;

        }


        // ==================================================
        // Search Validation
        // ==================================================

        search =
            String(search)
                .trim()
                .slice(
                    0,
                    MAX_SEARCH_LENGTH
                );


        const offset =
            (page - 1) * limit;


        let merchants;

        let total;


        // ==================================================
        // SEARCH MERCHANTS
        // ==================================================

        if (search) {

            const keyword =
                `%${search}%`;


            const [
                merchantRows
            ] = await db.query(

                merchantQueries
                    .SEARCH_MERCHANTS,

                [
                    keyword,
                    keyword,
                    keyword,
                    keyword,
                    keyword,
                    limit,
                    offset
                ]

            );


            merchants =
                merchantRows;


            // ==================================================
            // Search Count
            // ==================================================

            const [
                countRows
            ] = await db.query(

                `
                SELECT
                    COUNT(*) AS total
                FROM merchants
                WHERE deleted_at IS NULL
                  AND (
                        merchant_name LIKE ?
                     OR business_name LIKE ?
                     OR merchant_code LIKE ?
                     OR email LIKE ?
                     OR phone LIKE ?
                  )
                `,

                [
                    keyword,
                    keyword,
                    keyword,
                    keyword,
                    keyword
                ]

            );


            total =
                Number(
                    countRows[0]?.total || 0
                );

        }


        // ==================================================
        // GET ALL MERCHANTS
        // ==================================================

        else {

            const [
                merchantRows
            ] = await db.query(

                merchantQueries
                    .GET_ALL_MERCHANTS,

                [
                    limit,
                    offset
                ]

            );


            merchants =
                merchantRows;


            // ==================================================
            // Total Count
            // ==================================================

            const [
                countRows
            ] = await db.query(

                merchantQueries
                    .COUNT_ALL_MERCHANTS

            );


            total =
                Number(
                    countRows[0]?.total || 0
                );

        }


        // ==================================================
        // Safe Merchant List
        // ==================================================

        const safeMerchants =
            merchants.map(
                merchant => ({

                    merchantId:
                        merchant.merchant_id,

                    merchantCode:
                        merchant.merchant_code,

                    businessName:
                        merchant.business_name,

                    merchantName:
                        merchant.merchant_name,

                    email:
                        merchant.email,

                    phone:
                        merchant.phone,

                    website:
                        merchant.website,

                    approvalStatus:
                        merchant.approval_status,

                    kycStatus:
                        merchant.kyc_status,

                    accountStatus:
                        merchant.account_status,

                    emailVerified:
                        Boolean(
                            merchant.email_verified
                        ),

                    createdAt:
                        merchant.created_at,

                    updatedAt:
                        merchant.updated_at

                })
            );


        // ==================================================
        // AUDIT LOG
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .MERCHANT_LIST_VIEWED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .MERCHANT,

            entityId:
                null,

            status:
                AUDIT_STATUS
                    .SUCCESS,

            ipAddress,

            userAgent,

            requestId,

            metadata: {

                page,

                limit,

                searchApplied:
                    Boolean(search),

                search:
                    search || null,

                resultCount:
                    safeMerchants.length,

                totalRecords:
                    total

            }

        });


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                "Merchant list fetched successfully.",

            data:
                safeMerchants,

            pagination: {

                currentPage:
                    page,

                perPage:
                    limit,

                totalRecords:
                    total,

                totalPages:
                    Math.ceil(
                        total / limit
                    )

            }

        };


    } catch (error) {

        console.error(
            "Get Merchant List Error:",
            error
        );

        throw error;

    }

};


// ==========================================================
// GET MERCHANT BY ID
// ==========================================================

const getMerchantById = async (
    merchantId,
    auditContext = {}
) => {

    // ==================================================
    // Audit Context
    // ==================================================

    const {
        adminId = null,
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    // ==================================================
    // Validate Admin
    // ==================================================

    if (
        !adminId ||
        !Number.isInteger(Number(adminId)) ||
        Number(adminId) <= 0
    ) {

        return {
            success: false,
            statusCode: 401,
            message:
                "Invalid admin authentication."
        };

    }


    const normalizedAdminId =
        Number(adminId);


    // ==================================================
    // Validate Merchant ID
    // ==================================================

    if (
        !isValidMerchantId(
            merchantId
        )
    ) {

        // ------------------------------------------------
        // Failed Audit
        // ------------------------------------------------

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .MERCHANT_VIEWED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .MERCHANT,

            entityId:
                Number.isInteger(
                    Number(merchantId)
                )
                    ? Number(merchantId)
                    : null,

            status:
                AUDIT_STATUS.FAILED,

            ipAddress,

            userAgent,

            requestId,

            metadata: {

                reason:
                    "INVALID_MERCHANT_ID"

            }

        });


        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid merchant ID."

        };

    }


    try {

        // ==================================================
        // Merchant
        // ==================================================

        const [
            merchantRows
        ] = await db.query(

            merchantQueries
                .GET_MERCHANT_BY_ID,

            [
                merchantId
            ]

        );


        // ==================================================
        // Merchant Not Found
        // ==================================================

        if (
            !merchantRows.length
        ) {

            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .MERCHANT_VIEWED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .MERCHANT,

                entityId:
                    Number(merchantId),

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,

                userAgent,

                requestId,

                metadata: {

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
        // KYC
        // ==================================================

        const [
            kycRows
        ] = await db.query(

            merchantQueries
                .GET_KYC_BY_MERCHANT,

            [
                merchantId
            ]

        );


        // ==================================================
        // API Credentials
        //
        // NEVER expose secret_key_hash
        // ==================================================

        const [
            apiRows
        ] = await db.query(

            `
            SELECT
                credential_id,
                merchant_id,
                public_key,
                environment,
                status,
                last_used_at,
                created_at,
                updated_at
            FROM api_credentials
            WHERE merchant_id = ?
            ORDER BY created_at DESC
            `,

            [
                merchantId
            ]

        );


        const safeApiCredentials =
            apiRows.map(
                credential => ({

                    credentialId:
                        credential.credential_id,

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
        // SUCCESS AUDIT
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .MERCHANT_VIEWED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .MERCHANT,

            entityId:
                merchant.merchant_id,

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,

            userAgent,

            requestId,

            metadata: {

                merchantCode:
                    merchant.merchant_code,

                kycIncluded:
                    Boolean(
                        kycRows.length
                    ),

                apiCredentialsCount:
                    safeApiCredentials.length

            }

        });


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                "Merchant details fetched successfully.",

            data: {

                merchant: {

                    merchantId:
                        merchant.merchant_id,

                    merchantCode:
                        merchant.merchant_code,

                    businessName:
                        merchant.business_name,

                    merchantName:
                        merchant.merchant_name,

                    email:
                        merchant.email,

                    phone:
                        merchant.phone,

                    website:
                        merchant.website,

                    approvalStatus:
                        merchant.approval_status,

                    kycStatus:
                        merchant.kyc_status,

                    accountStatus:
                        merchant.account_status,

                    emailVerified:
                        Boolean(
                            merchant.email_verified
                        ),

                    twoFactorEnabled:
                        Boolean(
                            merchant.two_factor_enabled
                        ),

                    createdAt:
                        merchant.created_at,

                    updatedAt:
                        merchant.updated_at

                },

                kyc:
                    kycRows.length
                        ? kycRows[0]
                        : null,

                apiCredentials:
                    safeApiCredentials

            }

        };


    } catch (error) {

        console.error(
            "Get Merchant Details Error:",
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
                        .MERCHANT_VIEWED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .MERCHANT,

                entityId:
                    Number(merchantId),

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,

                userAgent,

                requestId,

                metadata: {

                    reason:
                        "INTERNAL_SERVER_ERROR",

                    errorCode:
                        error.code || null

                }

            });

        } catch (auditError) {

            console.error(
                "Merchant View Audit Error:",
                auditError.message
            );

        }


        throw error;

    }

};

// ==========================================================
// UPDATE MERCHANT
// ==========================================================

const updateMerchant = async (
    merchantId,
    merchantData,
    auditContext = {}
) => {

    if (
        !isValidMerchantId(
            merchantId
        )
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid merchant ID."

        };

    }


    const connection =
        await db.getConnection();


    const {
        adminId = null,
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    try {

        // ==================================================
        // Validate Admin
        // ==================================================

        if (
            !adminId ||
            !Number.isInteger(
                Number(adminId)
            ) ||
            Number(adminId) <= 0
        ) {

            return {

                success: false,

                statusCode: 401,

                message:
                    "Invalid admin authentication."

            };

        }


        const normalizedAdminId =
            Number(adminId);


        await connection.beginTransaction();


        // ==================================================
        // Lock Merchant
        // ==================================================

        const [
            merchantRows
        ] = await connection.query(

            `
            SELECT
                merchant_id,
                merchant_code,
                business_name,
                merchant_name,
                email,
                phone,
                website,
                approval_status,
                kyc_status,
                account_status,
                email_verified,
                two_factor_enabled,
                deleted_at
            FROM merchants
            WHERE merchant_id = ?
            FOR UPDATE
            `,

            [
                merchantId
            ]

        );


        // ==================================================
        // Merchant Not Found
        // ==================================================

        if (
            !merchantRows.length ||
            merchantRows[0].deleted_at
        ) {

            await safeRollback(
                connection
            );


            // Failed audit
            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .MERCHANT_UPDATED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .MERCHANT,

                entityId:
                    Number(merchantId),

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,

                userAgent,

                requestId,

                metadata: {

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


        const existingMerchant =
            merchantRows[0];


        // ==================================================
        // Protected Fields
        // ==================================================

        const protectedFields = [

            "merchantId",
            "merchant_id",

            "merchantCode",
            "merchant_code",

            "approvalStatus",
            "approval_status",

            "kycStatus",
            "kyc_status",

            "kycResubmissionAllowed",
            "kyc_resubmission_allowed",

            "accountStatus",
            "account_status",

            "emailVerified",
            "email_verified",

            "twoFactorEnabled",
            "two_factor_enabled",

            "password",
            "passwordHash",
            "password_hash",

            "deletedAt",
            "deleted_at"

        ];


        const attemptedProtectedFields =
            protectedFields.filter(

                field =>
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            merchantData,
                            field
                        )

            );


        if (
            attemptedProtectedFields.length
        ) {

            await safeRollback(
                connection
            );


            // Failed audit
            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .MERCHANT_UPDATED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .MERCHANT,

                entityId:
                    Number(merchantId),

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,

                userAgent,

                requestId,

                metadata: {

                    reason:
                        "PROTECTED_FIELDS_ATTEMPTED",

                    attemptedFields:
                        attemptedProtectedFields

                }

            });


            return {

                success: false,

                statusCode: 403,

                message:
                    "Protected merchant fields cannot be modified through this endpoint."

            };

        }


        // ==================================================
        // Dynamic Update Fields
        // ==================================================

        const fields = [];

        const values = [];


        // ==================================================
        // Business Name
        // ==================================================

        if (
            merchantData.businessName !==
            undefined
        ) {

            fields.push(
                "business_name = ?"
            );

            values.push(

                String(
                    merchantData.businessName
                ).trim()

            );

        }


        // ==================================================
        // Merchant Name
        // ==================================================

        if (
            merchantData.merchantName !==
            undefined
        ) {

            fields.push(
                "merchant_name = ?"
            );

            values.push(

                String(
                    merchantData.merchantName
                ).trim()

            );

        }


        // ==================================================
        // Phone
        // ==================================================

        if (
            merchantData.phone !==
            undefined
        ) {

            fields.push(
                "phone = ?"
            );

            values.push(

                String(
                    merchantData.phone
                ).trim()

            );

        }


        // ==================================================
        // Website
        // ==================================================

        if (
            merchantData.website !==
            undefined
        ) {

            fields.push(
                "website = ?"
            );

            values.push(

                normalizeString(
                    merchantData.website
                )

            );

        }


        // ==================================================
        // No Editable Fields
        // ==================================================

        if (
            !fields.length
        ) {

            await safeRollback(
                connection
            );


            await createAuditLog({

                adminId:
                    normalizedAdminId,

                action:
                    AUDIT_ACTIONS
                        .MERCHANT_UPDATED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .MERCHANT,

                entityId:
                    Number(merchantId),

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,

                userAgent,

                requestId,

                metadata: {

                    reason:
                        "NO_EDITABLE_FIELDS"

                }

            });


            return {

                success: false,

                statusCode: 400,

                message:
                    "No editable fields were provided."

            };

        }


        // ==================================================
        // Build Changed Fields + Old/New Values
        // ==================================================

        const changedFields = [];

        const oldValues = {};

        const newValues = {};


        if (
            merchantData.businessName !==
            undefined
        ) {

            const newValue =
                String(
                    merchantData.businessName
                ).trim();

            if (
                existingMerchant.business_name !==
                newValue
            ) {

                changedFields.push(
                    "businessName"
                );

                oldValues.businessName =
                    existingMerchant.business_name;

                newValues.businessName =
                    newValue;

            }

        }


        if (
            merchantData.merchantName !==
            undefined
        ) {

            const newValue =
                String(
                    merchantData.merchantName
                ).trim();

            if (
                existingMerchant.merchant_name !==
                newValue
            ) {

                changedFields.push(
                    "merchantName"
                );

                oldValues.merchantName =
                    existingMerchant.merchant_name;

                newValues.merchantName =
                    newValue;

            }

        }


        if (
            merchantData.phone !==
            undefined
        ) {

            const newValue =
                String(
                    merchantData.phone
                ).trim();

            if (
                existingMerchant.phone !==
                newValue
            ) {

                changedFields.push(
                    "phone"
                );

                oldValues.phone =
                    existingMerchant.phone;

                newValues.phone =
                    newValue;

            }

        }


        if (
            merchantData.website !==
            undefined
        ) {

            const newValue =
                normalizeString(
                    merchantData.website
                );

            if (
                existingMerchant.website !==
                newValue
            ) {

                changedFields.push(
                    "website"
                );

                oldValues.website =
                    existingMerchant.website;

                newValues.website =
                    newValue;

            }

        }


        // ==================================================
        // Update Merchant
        // ==================================================

        fields.push(
            "updated_at = CURRENT_TIMESTAMP"
        );

        values.push(
            merchantId
        );


        const [
            updateResult
        ] = await connection.query(

            `
            UPDATE merchants
            SET
                ${fields.join(", ")}
            WHERE merchant_id = ?
              AND deleted_at IS NULL
            `,

            values

        );


        if (
            updateResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to update merchant."
            );

        }


        // ==================================================
        // AUDIT LOG
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .MERCHANT_UPDATED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .MERCHANT,

            entityId:
                Number(merchantId),

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,

            userAgent,

            requestId,

            metadata: {

                merchantCode:
                    existingMerchant.merchant_code,

                changedFields,

                oldValues,

                newValues

            },

            connection

        });


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                "Merchant updated successfully."

        };


    } catch (error) {

        await safeRollback(
            connection
        );


        console.error(
            "Update Merchant Error:",
            error
        );


        // ==================================================
        // Failed Audit
        // ==================================================
        //
        // IMPORTANT:
        // The transaction has already been rolled back.
        // Therefore this audit is intentionally created
        // outside the rolled-back transaction.
        //
        // ==================================================

        try {

            if (
                adminId
            ) {

                await createAuditLog({

                    adminId:
                        Number(adminId),

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_UPDATED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId) || null,

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "UPDATE_FAILED",

                        errorCode:
                            error.code || null

                    }

                });

            }

        } catch (auditError) {

            console.error(
                "Merchant Update Audit Error:",
                auditError.message
            );

        }


        throw error;


    } finally {

        connection.release();

    }

};


// ==========================================================
// DELETE MERCHANT
// ==========================================================

const deleteMerchant = async (
    merchantId,
    auditContext = {}
) => {

    // ==================================================
    // Audit Context
    // ==================================================

    const {
        adminId = null,
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    // ==================================================
    // Validate Merchant ID
    // ==================================================

    if (
        !isValidMerchantId(
            merchantId
        )
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid merchant ID."

        };

    }


    // ==================================================
    // Validate Admin
    // ==================================================

    if (
        !adminId ||
        !Number.isInteger(
            Number(adminId)
        ) ||
        Number(adminId) <= 0
    ) {

        return {

            success: false,

            statusCode: 401,

            message:
                "Invalid admin authentication."

        };

    }


    const normalizedAdminId =
        Number(adminId);


    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        // ==================================================
        // Lock Merchant
        // ==================================================

        const [
            merchantRows
        ] = await connection.query(

            `
            SELECT
                merchant_id,
                merchant_code,
                business_name,
                merchant_name,
                deleted_at,
                account_status
            FROM merchants
            WHERE merchant_id = ?
            FOR UPDATE
            `,

            [
                merchantId
            ]

        );


        // ==================================================
        // Merchant Not Found
        // ==================================================

        if (
            !merchantRows.length ||
            merchantRows[0].deleted_at
        ) {

            await safeRollback(
                connection
            );


            // Failed audit
            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_DELETED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "MERCHANT_NOT_FOUND"

                    }

                });

            } catch (auditError) {

                console.error(
                    "Delete Merchant Audit Error:",
                    auditError.message
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
        // Revoke All API Credentials
        // ==================================================

        const [
            revokeResult
        ] = await connection.query(

            `
            UPDATE api_credentials
            SET
                status = 'REVOKED',
                updated_at = CURRENT_TIMESTAMP
            WHERE merchant_id = ?
              AND status != 'REVOKED'
            `,

            [
                merchantId
            ]

        );


        // ==================================================
        // Soft Delete + Block
        // ==================================================

        const [
            deleteResult
        ] = await connection.query(

            merchantQueries
                .DELETE_MERCHANT,

            [
                merchantId
            ]

        );


        if (
            deleteResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to delete merchant."
            );

        }


        // ==================================================
        // Audit Log
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .MERCHANT_DELETED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .MERCHANT,

            entityId:
                Number(merchantId),

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,

            userAgent,

            requestId,

            metadata: {

                merchantCode:
                    merchant.merchant_code,

                merchantName:
                    merchant.merchant_name,

                businessName:
                    merchant.business_name,

                previousAccountStatus:
                    merchant.account_status,

                revokedApiCredentials:
                    revokeResult.affectedRows

            },

            connection

        });


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                "Merchant deleted successfully."

        };


    } catch (error) {

        await safeRollback(
            connection
        );


        console.error(
            "Delete Merchant Error:",
            error
        );


        // ==================================================
        // Failed Audit
        // ==================================================

        try {

            if (
                adminId
            ) {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_DELETED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId) || null,

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "DELETE_FAILED",

                        errorCode:
                            error.code || null

                    }

                });

            }

        } catch (auditError) {

            console.error(
                "Delete Merchant Audit Error:",
                auditError.message
            );

        }


        throw error;


    } finally {

        connection.release();

    }

};


// ==========================================================
// UPLOAD / RESUBMIT MERCHANT KYC
// ==========================================================

const uploadMerchantKyc = async (
    merchantId,
    kycData,
    files,
    auditContext = {}
) => {

    // ==================================================
    // Audit Context
    // ==================================================

    const {
        adminId = null,
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    // ==================================================
    // Validate Merchant ID
    // ==================================================

    if (
        !isValidMerchantId(
            merchantId
        )
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid merchant ID."

        };

    }


    const connection =
        await db.getConnection();


    try {

        const {
            panNumber,
            aadhaarNumber
        } = kycData;


        // ==================================================
        // Files
        // ==================================================

        const panFile =
            files?.pan_document?.[0];

        const aadhaarFile =
            files?.aadhaar_document?.[0];


        if (
            !panFile ||
            !aadhaarFile
        ) {

            return {

                success: false,

                statusCode: 400,

                message:
                    "PAN and Aadhaar documents are required."

            };

        }


        // ==================================================
        // Server Generated Filenames
        // ==================================================

        const panDocument =
            panFile.filename;

        const aadhaarDocument =
            aadhaarFile.filename;


        if (
            !panDocument ||
            !aadhaarDocument
        ) {

            return {

                success: false,

                statusCode: 400,

                message:
                    "Uploaded document information is invalid."

            };

        }


        await connection.beginTransaction();


        // ==================================================
        // Lock Merchant
        // ==================================================

        const [
            merchantRows
        ] = await connection.query(

            `
            SELECT
                merchant_id,
                email_verified,
                approval_status,
                kyc_status,
                account_status
            FROM merchants
            WHERE merchant_id = ?
              AND deleted_at IS NULL
            FOR UPDATE
            `,

            [
                merchantId
            ]

        );


        // ==================================================
        // Merchant Not Found
        // ==================================================

        if (
            !merchantRows.length
        ) {

            await safeRollback(
                connection
            );


            return {

                success: false,

                statusCode: 404,

                message:
                    "Merchant not found."

            };

        }


        // ==================================================
        // Lock Existing KYC
        // ==================================================

        const [
            existingKyc
        ] = await connection.query(

            `
            SELECT
                kyc_id,
                kyc_status,
                kyc_resubmission_allowed
            FROM merchant_kyc
            WHERE merchant_id = ?
            FOR UPDATE
            `,

            [
                merchantId
            ]

        );


        let submissionType =
            "FIRST_SUBMISSION";


        // ==================================================
        // FIRST SUBMISSION
        // ==================================================

        if (
            !existingKyc.length
        ) {

            const [
                kycResult
            ] = await connection.query(

                merchantQueries
                    .CREATE_KYC,

                [
                    merchantId,
                    panNumber,
                    aadhaarNumber,
                    panDocument,
                    aadhaarDocument
                ]

            );


            if (
                kycResult.affectedRows !== 1
            ) {

                throw new Error(
                    "Failed to create merchant KYC."
                );

            }

        }


        // ==================================================
        // EXISTING KYC
        // ==================================================

        else {

            const kyc =
                existingKyc[0];


            // ----------------------------------------------
            // APPROVED
            // ----------------------------------------------

            if (
                kyc.kyc_status ===
                "APPROVED"
            ) {

                await safeRollback(
                    connection
                );


                return {

                    success: false,

                    statusCode: 409,

                    message:
                        "KYC is already approved."

                };

            }


            // ----------------------------------------------
            // PENDING
            // ----------------------------------------------

            if (
                kyc.kyc_status ===
                "PENDING"
            ) {

                await safeRollback(
                    connection
                );


                return {

                    success: false,

                    statusCode: 409,

                    message:
                        "KYC is already pending admin verification."

                };

            }


            // ----------------------------------------------
            // REJECTED + RESUBMISSION DISABLED
            // ----------------------------------------------

            if (
                kyc.kyc_status ===
                "REJECTED" &&
                !Boolean(
                    kyc.kyc_resubmission_allowed
                )
            ) {

                await safeRollback(
                    connection
                );


                return {

                    success: false,

                    statusCode: 403,

                    code:
                        "KYC_RESUBMISSION_NOT_ALLOWED",

                    message:
                        "KYC resubmission has not been enabled by admin."

                };

            }


            // ----------------------------------------------
            // REJECTED + RESUBMISSION ENABLED
            // ----------------------------------------------

            submissionType =
                "RESUBMISSION";


            const [
                updateResult
            ] = await connection.query(

                merchantQueries
                    .RESET_KYC_FOR_RESUBMISSION,

                [
                    panNumber,
                    aadhaarNumber,
                    panDocument,
                    aadhaarDocument,
                    merchantId
                ]

            );


            if (
                updateResult.affectedRows !== 1
            ) {

                throw new Error(
                    "Failed to resubmit merchant KYC."
                );

            }

        }


        // ==================================================
        // Sync merchant KYC Status
        // ==================================================

        const [
            merchantKycResult
        ] = await connection.query(

            merchantQueries
                .UPDATE_KYC_STATUS,

            [
                "PENDING",
                merchantId
            ]

        );


        if (
            merchantKycResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to update merchant KYC status."
            );

        }


        // ==================================================
        // AUDIT LOG
        // ==================================================
        //
        // Do NOT store:
        // - PAN number
        // - Aadhaar number
        // - document filename/path
        // - uploaded document content
        //
        // ==================================================

        if (adminId) {

            await createAuditLog({

                adminId:
                    Number(adminId),

                action:
                    AUDIT_ACTIONS
                        .KYC_UPLOADED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .KYC,

                entityId:
                    existingKyc.length
                        ? existingKyc[0].kyc_id
                        : null,

                status:
                    AUDIT_STATUS.SUCCESS,

                ipAddress,

                userAgent,

                requestId,

                metadata: {

                    merchantId:
                        Number(merchantId),

                    submissionType,

                    status:
                        "PENDING",

                    panDocumentUploaded:
                        true,

                    aadhaarDocumentUploaded:
                        true

                },

                connection

            });

        }


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 201,

            message:
                "Merchant KYC submitted successfully. Awaiting admin verification."

        };


    } catch (error) {

        await safeRollback(
            connection
        );


        console.error(
            "Upload Merchant KYC Error:",
            error
        );


        // ==================================================
        // Failed Audit
        // ==================================================

        try {

            if (adminId) {

                await createAuditLog({

                    adminId:
                        Number(adminId),

                    action:
                        AUDIT_ACTIONS
                            .KYC_UPLOADED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .KYC,

                    entityId:
                        Number(merchantId) || null,

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "KYC_UPLOAD_FAILED",

                        errorCode:
                            error.code || null

                    }

                });

            }

        } catch (auditError) {

            console.error(
                "KYC Upload Audit Error:",
                auditError.message
            );

        }


        throw error;


    } finally {

        connection.release();

    }

};


// ==========================================================
// UPDATE ACCOUNT STATUS
// ==========================================================

const updateAccountStatus = async (
    merchantId,
    accountStatus,
    auditContext = {}
) => {

    // ==================================================
    // Audit Context
    // ==================================================

    const {
        adminId = null,
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    // ==================================================
    // Validate Merchant ID
    // ==================================================

    if (
        !isValidMerchantId(
            merchantId
        )
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid merchant ID."

        };

    }


    // ==================================================
    // Validate Admin
    // ==================================================

    if (
        !adminId ||
        !Number.isInteger(
            Number(adminId)
        ) ||
        Number(adminId) <= 0
    ) {

        return {

            success: false,

            statusCode: 401,

            message:
                "Invalid admin authentication."

        };

    }


    const normalizedAdminId =
        Number(adminId);


    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        // ==================================================
        // Lock Merchant
        // ==================================================

        const [
            merchantRows
        ] = await connection.query(

            `
            SELECT
                merchant_id,
                merchant_code,
                approval_status,
                kyc_status,
                email_verified,
                account_status,
                deleted_at
            FROM merchants
            WHERE merchant_id = ?
            FOR UPDATE
            `,

            [
                merchantId
            ]

        );


        // ==================================================
        // Merchant Not Found
        // ==================================================

        if (
            !merchantRows.length ||
            merchantRows[0].deleted_at
        ) {

            await safeRollback(
                connection
            );


            // Failed audit
            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_ACCOUNT_STATUS_CHANGED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "MERCHANT_NOT_FOUND"

                    }

                });

            } catch (auditError) {

                console.error(
                    "Account Status Audit Error:",
                    auditError.message
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


        const previousAccountStatus =
            merchant.account_status;


        // ==================================================
        // ACTIVE Eligibility
        // ==================================================

        if (
            accountStatus ===
            "ACTIVE" &&
            (
                !Boolean(
                    merchant.email_verified
                ) ||
                merchant.kyc_status !==
                "APPROVED" ||
                merchant.approval_status !==
                "APPROVED"
            )
        ) {

            await safeRollback(
                connection
            );


            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_ACCOUNT_STATUS_CHANGED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "MERCHANT_NOT_ELIGIBLE",

                        requestedStatus:
                            accountStatus,

                        currentStatus:
                            previousAccountStatus

                    }

                });

            } catch (auditError) {

                console.error(
                    "Account Status Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 403,

                code:
                    "MERCHANT_NOT_ELIGIBLE",

                message:
                    "Merchant cannot be activated until email verification, KYC approval and merchant approval are completed."

            };

        }


        // ==================================================
        // Do Not Automatically Unblock
        // ==================================================

        if (
            merchant.account_status ===
            "BLOCKED" &&
            accountStatus !==
            "BLOCKED"
        ) {

            await safeRollback(
                connection
            );


            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_ACCOUNT_STATUS_CHANGED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "BLOCKED_MERCHANT_REQUIRES_SEPARATE_FLOW",

                        requestedStatus:
                            accountStatus,

                        currentStatus:
                            previousAccountStatus

                    }

                });

            } catch (auditError) {

                console.error(
                    "Account Status Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    "Blocked merchant requires a separate unblock/activation flow."

            };

        }


        // ==================================================
        // Same Status
        // ==================================================

        if (
            merchant.account_status ===
            accountStatus
        ) {

            await safeRollback(
                connection
            );


            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_ACCOUNT_STATUS_CHANGED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "STATUS_ALREADY_SET",

                        currentStatus:
                            previousAccountStatus,

                        requestedStatus:
                            accountStatus

                    }

                });

            } catch (auditError) {

                console.error(
                    "Account Status Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    `Merchant is already ${accountStatus}.`

            };

        }


        // ==================================================
        // Update Account Status
        // ==================================================

        const [
            updateResult
        ] = await connection.query(

            merchantQueries
                .UPDATE_ACCOUNT_STATUS,

            [
                accountStatus,
                merchantId
            ]

        );


        if (
            updateResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to update merchant account status."
            );

        }


        // ==================================================
        // Disable API Credentials
        // ==================================================

        let inactiveCredentialCount =
            0;


        if (
            [
                "BLOCKED",
                "OFFLINE",
                "HOLD"
            ].includes(
                accountStatus
            )
        ) {

            const [
                credentialResult
            ] = await connection.query(

                `
                UPDATE api_credentials
                SET
                    status = 'INACTIVE',
                    updated_at = CURRENT_TIMESTAMP
                WHERE merchant_id = ?
                  AND status = 'ACTIVE'
                `,

                [
                    merchantId
                ]

            );


            inactiveCredentialCount =
                credentialResult.affectedRows;

        }


        // ==================================================
        // Audit Log
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .MERCHANT_ACCOUNT_STATUS_CHANGED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .MERCHANT,

            entityId:
                Number(merchantId),

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,

            userAgent,

            requestId,

            metadata: {

                merchantCode:
                    merchant.merchant_code,

                previousStatus:
                    previousAccountStatus,

                newStatus:
                    accountStatus,

                inactiveCredentialCount

            },

            connection

        });


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                `Merchant account status updated to ${accountStatus}.`

        };


    } catch (error) {

        await safeRollback(
            connection
        );


        console.error(
            "Update Account Status Error:",
            error
        );


        // ==================================================
        // Failed Audit
        // ==================================================

        try {

            if (
                adminId
            ) {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_ACCOUNT_STATUS_CHANGED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId) || null,

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "ACCOUNT_STATUS_UPDATE_FAILED",

                        errorCode:
                            error.code || null,

                        requestedStatus:
                            accountStatus

                    }

                });

            }

        } catch (auditError) {

            console.error(
                "Account Status Audit Error:",
                auditError.message
            );

        }


        throw error;


    } finally {

        connection.release();

    }

};


// ==========================================================
// APPROVE MERCHANT
// ==========================================================

const approveMerchant = async (
    merchantId,
    auditContext = {}
) => {

    // ==================================================
    // Audit Context
    // ==================================================

    const {
        adminId = null,
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    // ==================================================
    // Validate Merchant ID
    // ==================================================

    if (
        !isValidMerchantId(
            merchantId
        )
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid merchant ID."

        };

    }


    // ==================================================
    // Validate Admin
    // ==================================================

    if (
        !adminId ||
        !Number.isInteger(
            Number(adminId)
        ) ||
        Number(adminId) <= 0
    ) {

        return {

            success: false,

            statusCode: 401,

            message:
                "Invalid admin authentication."

        };

    }


    const normalizedAdminId =
        Number(adminId);


    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        // ==================================================
        // Lock Merchant
        // ==================================================

        const [
            merchantRows
        ] = await connection.query(

            `
            SELECT
                merchant_id,
                merchant_code,
                email_verified,
                approval_status,
                kyc_status,
                account_status
            FROM merchants
            WHERE merchant_id = ?
              AND deleted_at IS NULL
            FOR UPDATE
            `,

            [
                merchantId
            ]

        );


        // ==================================================
        // Merchant Not Found
        // ==================================================

        if (
            !merchantRows.length
        ) {

            await safeRollback(
                connection
            );


            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_APPROVED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "MERCHANT_NOT_FOUND"

                    }

                });

            } catch (auditError) {

                console.error(
                    "Approve Merchant Audit Error:",
                    auditError.message
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
        // Already Approved
        // ==================================================

        if (
            merchant.approval_status ===
            "APPROVED"
        ) {

            await safeRollback(
                connection
            );


            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_APPROVED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "MERCHANT_ALREADY_APPROVED"

                    }

                });

            } catch (auditError) {

                console.error(
                    "Approve Merchant Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    "Merchant already approved."

            };

        }


        // ==================================================
        // Email Verification
        // ==================================================

        if (
            !Boolean(
                merchant.email_verified
            )
        ) {

            await safeRollback(
                connection
            );


            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_APPROVED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "EMAIL_NOT_VERIFIED"

                    }

                });

            } catch (auditError) {

                console.error(
                    "Approve Merchant Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 403,

                code:
                    "EMAIL_NOT_VERIFIED",

                message:
                    "Merchant email must be verified before approval."

            };

        }


        // ==================================================
        // KYC Approval
        // ==================================================

        if (
            merchant.kyc_status !==
            "APPROVED"
        ) {

            await safeRollback(
                connection
            );


            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_APPROVED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "KYC_NOT_APPROVED"

                    }

                });

            } catch (auditError) {

                console.error(
                    "Approve Merchant Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 403,

                code:
                    "KYC_NOT_APPROVED",

                message:
                    "Merchant cannot be approved until KYC is approved."

            };

        }


        // ==================================================
        // BLOCKED Merchant Protection
        // ==================================================

        if (
            merchant.account_status ===
            "BLOCKED"
        ) {

            await safeRollback(
                connection
            );


            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .MERCHANT_APPROVED,

                    entityType:
                        AUDIT_ENTITY_TYPES
                            .MERCHANT,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "BLOCKED_MERCHANT"

                    }

                });

            } catch (auditError) {

                console.error(
                    "Approve Merchant Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    "Blocked merchant cannot be automatically activated."

            };

        }


        // ==================================================
        // Approval
        // ==================================================

        const [
            approvalResult
        ] = await connection.query(

            `
            UPDATE merchants
            SET
                approval_status = 'APPROVED',
                updated_at = CURRENT_TIMESTAMP
            WHERE merchant_id = ?
              AND deleted_at IS NULL
              AND approval_status = 'PENDING'
            `,

            [
                merchantId
            ]

        );


        if (
            approvalResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to approve merchant."
            );

        }


        // ==================================================
        // Activate + Provision
        // ==================================================

        const activationResult =
            await activateMerchantIfEligible(
                connection,
                merchantId
            );


        if (
            !activationResult.eligible ||
            !activationResult.activated
        ) {

            throw new Error(
                "Merchant activation/provisioning failed."
            );

        }


        // ==================================================
        // Audit Log
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                AUDIT_ACTIONS
                    .MERCHANT_APPROVED,

            entityType:
                AUDIT_ENTITY_TYPES
                    .MERCHANT,

            entityId:
                Number(merchantId),

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,

            userAgent,

            requestId,

            metadata: {

                merchantCode:
                    merchant.merchant_code,

                previousApprovalStatus:
                    merchant.approval_status,

                newApprovalStatus:
                    "APPROVED",

                previousAccountStatus:
                    merchant.account_status,

                newAccountStatus:
                    "ACTIVE",

                kycStatus:
                    merchant.kyc_status,

                emailVerified:
                    Boolean(
                        merchant.email_verified
                    ),

                walletCreated:
                    Boolean(
                        activationResult
                            .walletCreated
                    ),

                apiCredentialsCreated:
                    Boolean(
                        activationResult
                            .apiCredentialsCreated
                    )

            },

            connection

        });


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                "Merchant approved and activated successfully.",

            data: {

                merchantId,

                approvalStatus:
                    "APPROVED",

                kycStatus:
                    "APPROVED",

                accountStatus:
                    "ACTIVE",

                walletCreated:
                    Boolean(
                        activationResult
                            .walletCreated
                    ),

                apiCredentialsCreated:
                    Boolean(
                        activationResult
                            .apiCredentialsCreated
                    ),

                wallet:
                    activationResult.wallet,

                apiCredentials:
                    activationResult.apiCredentials

            }

        };


    } catch (error) {

        await safeRollback(
            connection
        );


        console.error(
            "Approve Merchant Error:",
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
                        .MERCHANT_APPROVED,

                entityType:
                    AUDIT_ENTITY_TYPES
                        .MERCHANT,

                entityId:
                    Number(merchantId) || null,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,

                userAgent,

                requestId,

                metadata: {

                    reason:
                        "MERCHANT_APPROVAL_FAILED",

                    errorCode:
                        error.code || null

                }

            });

        } catch (auditError) {

            console.error(
                "Approve Merchant Audit Error:",
                auditError.message
            );

        }


        throw error;


    } finally {

        connection.release();

    }

};

// ==========================================================
// GENERATE API CREDENTIALS
// ==========================================================

const generateApiCredentials = async (
    merchantId,
    options = {},
    auditContext = {}
) => {

    const {
        environment,
        ipWhitelist = []
    } = options;


    // ==================================================
    // Audit Context
    // ==================================================

    const {
        adminId = null,
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    // ==================================================
    // Merchant ID
    // ==================================================

    if (
        !isValidMerchantId(
            merchantId
        )
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid merchant ID."

        };

    }


    // ==================================================
    // Environment
    // ==================================================

    if (
        ![
            "SANDBOX",
            "PRODUCTION"
        ].includes(
            environment
        )
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid API environment."

        };

    }


    // ==================================================
    // IP Whitelist
    // ==================================================

    if (
        !Array.isArray(ipWhitelist) ||
        ipWhitelist.length >
        MAX_IP_WHITELIST
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid IP whitelist."

        };

    }


    const normalizedIps =
        [
            ...new Set(
                ipWhitelist.map(
                    ip =>
                        String(ip).trim()
                )
            )
        ];


    for (
        const ip of normalizedIps
    ) {

        if (
            net.isIP(ip) === 0
        ) {

            return {

                success: false,

                statusCode: 400,

                message:
                    `Invalid IP address: ${ip}`

            };

        }

    }


    // ==================================================
    // Admin Validation
    // ==================================================

    if (
        !adminId ||
        !Number.isInteger(
            Number(adminId)
        ) ||
        Number(adminId) <= 0
    ) {

        return {

            success: false,

            statusCode: 401,

            message:
                "Invalid admin authentication."

        };

    }


    const normalizedAdminId =
        Number(adminId);


    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        // ==================================================
        // Lock Merchant
        // ==================================================

        const [
            merchantRows
        ] = await connection.query(

            `
            SELECT
                merchant_id,
                merchant_code,
                email_verified,
                approval_status,
                kyc_status,
                account_status,
                deleted_at
            FROM merchants
            WHERE merchant_id = ?
            FOR UPDATE
            `,

            [
                merchantId
            ]

        );


        // ==================================================
        // Merchant Not Found
        // ==================================================

        if (
            !merchantRows.length ||
            merchantRows[0].deleted_at
        ) {

            await safeRollback(
                connection
            );


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
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "MERCHANT_NOT_FOUND",

                        environment

                    }

                });

            } catch (auditError) {

                console.error(
                    "API Credential Audit Error:",
                    auditError.message
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
        // Strict Eligibility
        // ==================================================

        if (
            !Boolean(
                merchant.email_verified
            ) ||
            merchant.kyc_status !==
            "APPROVED" ||
            merchant.approval_status !==
            "APPROVED" ||
            merchant.account_status !==
            "ACTIVE"
        ) {

            await safeRollback(
                connection
            );


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
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "MERCHANT_NOT_ELIGIBLE",

                        environment

                    }

                });

            } catch (auditError) {

                console.error(
                    "API Credential Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 403,

                code:
                    "MERCHANT_NOT_ELIGIBLE",

                message:
                    "API credentials can only be generated for an active, approved merchant with verified email and approved KYC."

            };

        }


        // ==================================================
        // Check Existing Environment
        // ==================================================

        const [
            existingCredentials
        ] = await connection.query(

            `
            SELECT
                credential_id,
                status
            FROM api_credentials
            WHERE merchant_id = ?
              AND environment = ?
              AND status != 'REVOKED'
            LIMIT 1
            `,

            [
                merchantId,
                environment
            ]

        );


        if (
            existingCredentials.length
        ) {

            await safeRollback(
                connection
            );


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
                        existingCredentials[0]
                            .credential_id,

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "CREDENTIAL_ALREADY_EXISTS",

                        environment

                    }

                });

            } catch (auditError) {

                console.error(
                    "API Credential Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    `${environment} API credentials already exist.`

            };

        }


        // ==================================================
        // Generate Public Key
        // ==================================================

        const prefix =
            environment ===
                "PRODUCTION"
                ? "live"
                : "test";


        const publicKey =
            `pk_${prefix}_` +
            crypto
                .randomBytes(24)
                .toString("hex");


        // ==================================================
        // Generate Secret
        // ==================================================

        const secretKey =
            `sk_${prefix}_` +
            crypto
                .randomBytes(32)
                .toString("hex");


        // ==================================================
        // Hash Secret
        // ==================================================

        const secretKeyHash =
            await bcrypt.hash(
                secretKey,
                BCRYPT_ROUNDS
            );


        // ==================================================
        // Create API Credential
        // ==================================================

        const [
            credentialResult
        ] = await connection.query(

            `
            INSERT INTO api_credentials
            (
                merchant_id,
                public_key,
                secret_key_hash,
                environment,
                status
            )
            VALUES (
                ?, ?, ?, ?, 'ACTIVE'
            )
            `,

            [
                merchantId,
                publicKey,
                secretKeyHash,
                environment
            ]

        );


        if (
            credentialResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to create API credentials."
            );

        }


        const credentialId =
            credentialResult.insertId;


        // ==================================================
        // Create IP Whitelist
        // ==================================================

        for (
            const ip of normalizedIps
        ) {

            await connection.query(

                `
                INSERT INTO api_ip_whitelist
                (
                    credential_id,
                    ip_address,
                    status
                )
                VALUES (
                    ?, ?, 'ACTIVE'
                )
                `,

                [
                    credentialId,
                    ip
                ]

            );

        }


        // ==================================================
        // AUDIT LOG
        // ==================================================
        //
        // NEVER store:
        // - secretKey
        // - secretKeyHash
        // - complete API secret
        //
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
                Number(credentialId),

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,

            userAgent,

            requestId,

            metadata: {

                merchantId:
                    Number(merchantId),

                merchantCode:
                    merchant.merchant_code,

                environment,

                publicKey,

                ipWhitelistCount:
                    normalizedIps.length,

                ipWhitelistConfigured:
                    normalizedIps.length > 0

            },

            connection

        });


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Secret Returned ONLY ON CREATION
        // ==================================================

        return {

            success: true,

            statusCode: 201,

            message:
                "API credentials generated successfully. Store the secret key securely; it will not be shown again.",

            apiCredentials: {

                credentialId,

                environment,

                publicKey,

                secretKey,

                ipWhitelist:
                    normalizedIps

            }

        };


    } catch (error) {

        await safeRollback(
            connection
        );


        // ==================================================
        // Duplicate Public Key
        // ==================================================

        if (
            isDuplicateKey(
                error,
                "public_key"
            )
        ) {

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
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "DUPLICATE_PUBLIC_KEY",

                        environment

                    }

                });

            } catch (auditError) {

                console.error(
                    "API Credential Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    "Unable to generate unique API credentials. Please try again."

            };

        }


        // ==================================================
        // Duplicate IP
        // ==================================================

        if (
            isDuplicateKey(
                error,
                "uk_credential_ip"
            )
        ) {

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
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "DUPLICATE_IP_ADDRESS",

                        environment

                    }

                });

            } catch (auditError) {

                console.error(
                    "API Credential Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    "Duplicate IP address found in whitelist."

            };

        }


        // ==================================================
        // Generic Error Audit
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
                    Number(merchantId) || null,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,

                userAgent,

                requestId,

                metadata: {

                    reason:
                        "API_CREDENTIAL_CREATION_FAILED",

                    environment,

                    errorCode:
                        error.code || null

                }

            });

        } catch (auditError) {

            console.error(
                "API Credential Audit Error:",
                auditError.message
            );

        }


        console.error(
            "Generate API Credentials Error:",
            error
        );


        throw error;


    } finally {

        connection.release();

    }

};


// ==========================================================
// APPROVE / REJECT KYC
// ==========================================================

const approveMerchantKyc = async (
    merchantId,
    kycStatus,
    verificationNotes,
    adminId,
    auditContext = {}
) => {

    // ==================================================
    // Audit Context
    // ==================================================

    const {
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    // ==================================================
    // Validate Merchant ID
    // ==================================================

    if (
        !isValidMerchantId(
            merchantId
        )
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid merchant ID."

        };

    }


    // ==================================================
    // Validate KYC Status
    // ==================================================

    if (
        ![
            "APPROVED",
            "REJECTED"
        ].includes(
            kycStatus
        )
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid KYC status."

        };

    }


    // ==================================================
    // Validate Admin
    // ==================================================

    if (
        !adminId ||
        !Number.isInteger(
            Number(adminId)
        ) ||
        Number(adminId) <= 0
    ) {

        return {

            success: false,

            statusCode: 401,

            message:
                "Valid admin authentication is required."

        };

    }


    const normalizedAdminId =
        Number(adminId);


    // ==================================================
    // Verification Notes
    // ==================================================

    const notes =
        verificationNotes
            ? String(
                verificationNotes
            )
                .trim()
                .slice(
                    0,
                    MAX_VERIFICATION_NOTES_LENGTH
                )
            : null;


    const connection =
        await db.getConnection();


    // ==================================================
    // Audit Action
    // ==================================================

    const auditAction =
        kycStatus === "APPROVED"
            ? AUDIT_ACTIONS.KYC_APPROVED
            : AUDIT_ACTIONS.KYC_REJECTED;


    try {

        await connection.beginTransaction();


        // ==================================================
        // Lock Merchant
        // ==================================================

        const [
            merchantRows
        ] = await connection.query(

            `
            SELECT
                merchant_id,
                merchant_code,
                email_verified,
                approval_status,
                kyc_status,
                account_status
            FROM merchants
            WHERE merchant_id = ?
              AND deleted_at IS NULL
            FOR UPDATE
            `,

            [
                merchantId
            ]

        );


        // ==================================================
        // Merchant Not Found
        // ==================================================

        if (
            !merchantRows.length
        ) {

            await safeRollback(
                connection
            );


            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        auditAction,

                    entityType:
                        AUDIT_ENTITY_TYPES.KYC,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "MERCHANT_NOT_FOUND",

                        requestedStatus:
                            kycStatus

                    }

                });

            } catch (auditError) {

                console.error(
                    "KYC Audit Error:",
                    auditError.message
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
        // Lock KYC
        // ==================================================

        const [
            kycRows
        ] = await connection.query(

            `
            SELECT
                kyc_id,
                kyc_status,
                kyc_resubmission_allowed
            FROM merchant_kyc
            WHERE merchant_id = ?
            FOR UPDATE
            `,

            [
                merchantId
            ]

        );


        // ==================================================
        // KYC Not Found
        // ==================================================

        if (
            !kycRows.length
        ) {

            await safeRollback(
                connection
            );


            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        auditAction,

                    entityType:
                        AUDIT_ENTITY_TYPES.KYC,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "KYC_NOT_FOUND",

                        requestedStatus:
                            kycStatus

                    }

                });

            } catch (auditError) {

                console.error(
                    "KYC Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 404,

                message:
                    "Merchant KYC not found."

            };

        }


        const kyc =
            kycRows[0];


        // ==================================================
        // Only PENDING can be processed
        // ==================================================

        if (
            kyc.kyc_status !==
            "PENDING"
        ) {

            await safeRollback(
                connection
            );


            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        auditAction,

                    entityType:
                        AUDIT_ENTITY_TYPES.KYC,

                    entityId:
                        Number(
                            kyc.kyc_id
                        ),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "KYC_ALREADY_PROCESSED",

                        currentStatus:
                            kyc.kyc_status,

                        requestedStatus:
                            kycStatus

                    }

                });

            } catch (auditError) {

                console.error(
                    "KYC Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    `Merchant KYC is already ${kyc.kyc_status}.`

            };

        }


        // ==================================================
        // Update KYC
        // ==================================================

        const [
            kycResult
        ] = await connection.query(

            `
            UPDATE merchant_kyc
            SET
                kyc_status = ?,
                kyc_resubmission_allowed = FALSE,
                verification_notes = ?,
                verified_by = ?,
                verified_at = NOW(),
                updated_at = CURRENT_TIMESTAMP
            WHERE merchant_id = ?
              AND kyc_status = 'PENDING'
            `,

            [
                kycStatus,
                notes,
                normalizedAdminId,
                merchantId
            ]

        );


        if (
            kycResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to update merchant KYC."
            );

        }


        // ==================================================
        // Sync merchants.kyc_status
        // ==================================================

        const [
            merchantResult
        ] = await connection.query(

            merchantQueries
                .UPDATE_KYC_STATUS,

            [
                kycStatus,
                merchantId
            ]

        );


        if (
            merchantResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to synchronize merchant KYC status."
            );

        }


        // ==================================================
        // Audit Log
        // ==================================================

        await createAuditLog({

            adminId:
                normalizedAdminId,

            action:
                auditAction,

            entityType:
                AUDIT_ENTITY_TYPES.KYC,

            entityId:
                Number(
                    kyc.kyc_id
                ),

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,

            userAgent,

            requestId,

            metadata: {

                merchantId:
                    Number(merchantId),

                merchantCode:
                    merchant.merchant_code,

                previousStatus:
                    "PENDING",

                newStatus:
                    kycStatus,

                resubmissionAllowed:
                    false

            },

            connection

        });


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                kycStatus === "APPROVED"
                    ? "Merchant KYC approved successfully."
                    : "Merchant KYC rejected successfully.",

            data: {

                merchantId,

                kycStatus,

                resubmissionAllowed:
                    false,

                verifiedBy:
                    normalizedAdminId

            }

        };


    } catch (error) {

        await safeRollback(
            connection
        );


        console.error(
            "Approve Merchant KYC Error:",
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
                    auditAction,

                entityType:
                    AUDIT_ENTITY_TYPES.KYC,

                entityId:
                    Number(merchantId) || null,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,

                userAgent,

                requestId,

                metadata: {

                    reason:
                        "KYC_VERIFICATION_FAILED",

                    requestedStatus:
                        kycStatus,

                    errorCode:
                        error.code || null

                }

            });

        } catch (auditError) {

            console.error(
                "KYC Audit Error:",
                auditError.message
            );

        }


        throw error;


    } finally {

        connection.release();

    }

};


// ==========================================================
// ALLOW KYC RESUBMISSION
// ==========================================================

const allowKycResubmission = async (
    merchantId,
    auditContext = {}
) => {

    // ==================================================
    // Audit Context
    // ==================================================

    const {
        adminId = null,
        ipAddress = null,
        userAgent = null,
        requestId = null
    } = auditContext;


    // ==================================================
    // Validate Merchant ID
    // ==================================================

    if (
        !isValidMerchantId(
            merchantId
        )
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid merchant ID."

        };

    }


    // ==================================================
    // Validate Admin
    // ==================================================

    if (
        !adminId ||
        !Number.isInteger(
            Number(adminId)
        ) ||
        Number(adminId) <= 0
    ) {

        return {

            success: false,

            statusCode: 401,

            message:
                "Valid admin authentication is required."

        };

    }


    const normalizedAdminId =
        Number(adminId);


    try {

        // ==================================================
        // Get Current KYC Status
        // ==================================================

        const [
            kycRows
        ] = await db.query(

            `
            SELECT
                kyc_id,
                merchant_id,
                kyc_status,
                kyc_resubmission_allowed
            FROM merchant_kyc
            WHERE merchant_id = ?
            LIMIT 1
            `,

            [
                merchantId
            ]

        );


        // ==================================================
        // KYC Not Found
        // ==================================================

        if (
            !kycRows.length
        ) {

            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .KYC_RESUBMISSION_ALLOWED,

                    entityType:
                        AUDIT_ENTITY_TYPES.KYC,

                    entityId:
                        Number(merchantId),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        reason:
                            "KYC_NOT_FOUND"

                    }

                });

            } catch (auditError) {

                console.error(
                    "KYC Resubmission Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 404,

                message:
                    "Merchant KYC not found."

            };

        }


        const kyc =
            kycRows[0];


        // ==================================================
        // Only REJECTED KYC Can Be Resubmitted
        // ==================================================

        if (
            kyc.kyc_status !==
            "REJECTED"
        ) {

            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .KYC_RESUBMISSION_ALLOWED,

                    entityType:
                        AUDIT_ENTITY_TYPES.KYC,

                    entityId:
                        Number(kyc.kyc_id),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        merchantId:
                            Number(merchantId),

                        reason:
                            "KYC_NOT_REJECTED",

                        currentStatus:
                            kyc.kyc_status

                    }

                });

            } catch (auditError) {

                console.error(
                    "KYC Resubmission Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    "KYC must be rejected before resubmission can be enabled."

            };

        }


        // ==================================================
        // Already Enabled
        // ==================================================

        if (
            Boolean(
                kyc.kyc_resubmission_allowed
            )
        ) {

            try {

                await createAuditLog({

                    adminId:
                        normalizedAdminId,

                    action:
                        AUDIT_ACTIONS
                            .KYC_RESUBMISSION_ALLOWED,

                    entityType:
                        AUDIT_ENTITY_TYPES.KYC,

                    entityId:
                        Number(kyc.kyc_id),

                    status:
                        AUDIT_STATUS.FAILED,

                    ipAddress,

                    userAgent,

                    requestId,

                    metadata: {

                        merchantId:
                            Number(merchantId),

                        reason:
                            "RESUBMISSION_ALREADY_ENABLED"

                    }

                });

            } catch (auditError) {

                console.error(
                    "KYC Resubmission Audit Error:",
                    auditError.message
                );

            }


            return {

                success: false,

                statusCode: 409,

                message:
                    "KYC resubmission is already enabled."

            };

        }


        // ==================================================
        // Enable Resubmission
        // ==================================================

        const [
            result
        ] = await db.query(

            merchantQueries
                .ALLOW_KYC_RESUBMISSION,

            [
                merchantId
            ]

        );


        if (
            result.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to enable KYC resubmission."
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
                    .KYC_RESUBMISSION_ALLOWED,

            entityType:
                AUDIT_ENTITY_TYPES.KYC,

            entityId:
                Number(kyc.kyc_id),

            status:
                AUDIT_STATUS.SUCCESS,

            ipAddress,

            userAgent,

            requestId,

            metadata: {

                merchantId:
                    Number(merchantId),

                previousStatus:
                    false,

                newStatus:
                    true,

                kycStatus:
                    "REJECTED"

            }

        });


        // ==================================================
        // Response
        // ==================================================

        return {

            success: true,

            statusCode: 200,

            message:
                "KYC resubmission enabled successfully."

        };


    } catch (error) {

        console.error(
            "Allow KYC Resubmission Error:",
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
                        .KYC_RESUBMISSION_ALLOWED,

                entityType:
                    AUDIT_ENTITY_TYPES.KYC,

                entityId:
                    Number(merchantId) || null,

                status:
                    AUDIT_STATUS.FAILED,

                ipAddress,

                userAgent,

                requestId,

                metadata: {

                    reason:
                        "RESUBMISSION_ENABLE_FAILED",

                    errorCode:
                        error.code || null

                }

            });

        } catch (auditError) {

            console.error(
                "KYC Resubmission Audit Error:",
                auditError.message
            );

        }


        throw error;

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    createMerchant,

    getMerchantList,

    getMerchantById,

    updateMerchant,

    deleteMerchant,

    uploadMerchantKyc,

    approveMerchant,

    updateAccountStatus,

    approveMerchantKyc,

    generateApiCredentials,

    allowKycResubmission

};