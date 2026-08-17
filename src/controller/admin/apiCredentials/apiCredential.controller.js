const apiCredentialValidation =
    require(
        "../../../validations/admin/apiCredentials/apiCredentials.validations"
    );

const {
    generateApiCredentials,
    getApiCredentials,
    updateApiStatus,
    regenerateApiCredentials,
    revokeApiCredential
} = require(
    "../../../services/admin/apiCredentials/apiCredential.services"
);


// ==========================================================
// Helpers
// ==========================================================

const getAdminContext = (req) => {

    if (
        !req.admin ||
        !req.admin.admin_id
    ) {

        const error =
            new Error(
                "Admin authentication is required."
            );

        error.statusCode = 401;
        error.code =
            "ADMIN_AUTH_REQUIRED";

        throw error;
    }


    const adminId =
        Number(
            req.admin.admin_id
        );


    if (
        !Number.isInteger(adminId) ||
        adminId <= 0
    ) {

        const error =
            new Error(
                "Invalid admin authentication context."
            );

        error.statusCode = 401;
        error.code =
            "INVALID_ADMIN_CONTEXT";

        throw error;
    }


    return {

        adminId,

        auditContext: {

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.get("user-agent") ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        }

    };

};


// ==========================================================
// Generate API Credentials
// ==========================================================

const createApiCredentials = async (
    req,
    res,
    next
) => {

    try {

        const {
            adminId,
            auditContext
        } =
            getAdminContext(req);


        // ==================================================
        // Validate Request Body
        // ==================================================

        const {
            error,
            value
        } =
            apiCredentialValidation.validate(

                req.body,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        if (error) {

            return res.status(400).json({

                success: false,

                code:
                    "INVALID_API_CREDENTIAL_REQUEST",

                message:
                    error.details[0].message

            });

        }


        // ==================================================
        // Merchant ID
        // ==================================================

        const merchantId =
            Number(
                req.params.merchantId
            );


        if (
            !Number.isInteger(merchantId) ||
            merchantId <= 0
        ) {

            return res.status(400).json({

                success: false,

                code:
                    "INVALID_MERCHANT_ID",

                message:
                    "Invalid merchant ID."

            });

        }


        // ==================================================
        // Service
        // ==================================================

        const result =
            await generateApiCredentials(

                merchantId,

                value,

                adminId,

                auditContext

            );


        return res
            .status(
                result.statusCode || 201
            )
            .json(result);


    } catch (error) {

        handleApiCredentialError(
            error,
            res,
            next
        );

    }

};


// ==========================================================
// Get API Credentials
// ==========================================================

const getApiCredentialsController =
    async (
        req,
        res,
        next
    ) => {

        try {

            const {
                adminId,
                auditContext
            } =
                getAdminContext(req);


            const merchantId =
                Number(
                    req.params.merchantId
                );


            if (
                !Number.isInteger(
                    merchantId
                ) ||
                merchantId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    code:
                        "INVALID_MERCHANT_ID",

                    message:
                        "Invalid merchant ID."

                });

            }


            const result =
                await getApiCredentials(

                    merchantId,

                    adminId,

                    auditContext

                );


            return res
                .status(
                    result.statusCode || 200
                )
                .json(result);


        } catch (error) {

            handleApiCredentialError(
                error,
                res,
                next
            );

        }

    };


// ==========================================================
// Update API Credential Status
// ==========================================================

const updateApiCredentialStatus =
    async (
        req,
        res,
        next
    ) => {

        try {

            const {
                adminId,
                auditContext
            } =
                getAdminContext(req);


            // ==================================================
            // Validate Status
            // ==================================================

            const {
                error,
                value
            } =
                apiCredentialValidation
                    .statusValidation
                    .validate(

                        req.body,

                        {
                            abortEarly: true,
                            stripUnknown: true
                        }

                    );


            if (error) {

                return res.status(400).json({

                    success: false,

                    code:
                        "INVALID_API_CREDENTIAL_STATUS",

                    message:
                        error.details[0].message

                });

            }


            // ==================================================
            // Credential ID
            // ==================================================

            const credentialId =
                Number(
                    req.params.credentialId
                );


            if (
                !Number.isInteger(
                    credentialId
                ) ||
                credentialId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    code:
                        "INVALID_CREDENTIAL_ID",

                    message:
                        "Invalid credential ID."

                });

            }


            // ==================================================
            // Service
            // ==================================================

            const result =
                await updateApiStatus(

                    credentialId,

                    value.status,

                    adminId,

                    auditContext

                );


            return res
                .status(
                    result.statusCode || 200
                )
                .json(result);


        } catch (error) {

            handleApiCredentialError(
                error,
                res,
                next
            );

        }

    };


// ==========================================================
// Regenerate API Credentials
// ==========================================================

const regenerateApiCredentialsController =
    async (
        req,
        res,
        next
    ) => {

        try {

            const {
                adminId,
                auditContext
            } =
                getAdminContext(req);


            const credentialId =
                Number(
                    req.params.credentialId
                );


            if (
                !Number.isInteger(
                    credentialId
                ) ||
                credentialId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    code:
                        "INVALID_CREDENTIAL_ID",

                    message:
                        "Invalid credential ID."

                });

            }


            // ==================================================
            // Service
            // ==================================================

            const result =
                await regenerateApiCredentials(

                    credentialId,

                    adminId,

                    auditContext

                );


            return res
                .status(
                    result.statusCode || 200
                )
                .json(result);


        } catch (error) {

            handleApiCredentialError(
                error,
                res,
                next
            );

        }

    };


// ==========================================================
// Revoke API Credential
// ==========================================================

const revokeApiCredentialController =
    async (
        req,
        res,
        next
    ) => {

        try {

            const {
                adminId,
                auditContext
            } =
                getAdminContext(req);


            const credentialId =
                Number(
                    req.params.credentialId
                );


            if (
                !Number.isInteger(
                    credentialId
                ) ||
                credentialId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    code:
                        "INVALID_CREDENTIAL_ID",

                    message:
                        "Invalid credential ID."

                });

            }


            // ==================================================
            // Service
            // ==================================================

            const result =
                await revokeApiCredential(

                    credentialId,

                    adminId,

                    auditContext

                );


            return res
                .status(
                    result.statusCode || 200
                )
                .json(result);


        } catch (error) {

            handleApiCredentialError(
                error,
                res,
                next
            );

        }

    };


// ==========================================================
// Error Handler
// ==========================================================

const handleApiCredentialError = (
    error,
    res,
    next
) => {

    // ==================================================
    // Admin Authentication
    // ==================================================

    if (
        error.statusCode === 401 ||
        error.code ===
            "ADMIN_AUTH_REQUIRED"
    ) {

        return res.status(401).json({

            success: false,

            code:
                "ADMIN_AUTH_REQUIRED",

            message:
                "Admin authentication is required."

        });

    }


    // ==================================================
    // Invalid Admin Context
    // ==================================================

    if (
        error.code ===
        "INVALID_ADMIN_CONTEXT"
    ) {

        return res.status(401).json({

            success: false,

            code:
                "INVALID_ADMIN_CONTEXT",

            message:
                "Invalid admin authentication context."

        });

    }


    // ==================================================
    // Invalid Merchant ID
    // ==================================================

    if (
        error.message ===
        "Invalid merchant ID."
    ) {

        return res.status(400).json({

            success: false,

            code:
                "INVALID_MERCHANT_ID",

            message:
                error.message

        });

    }


    // ==================================================
    // Invalid Credential ID
    // ==================================================

    if (
        error.message ===
        "Invalid credential ID."
    ) {

        return res.status(400).json({

            success: false,

            code:
                "INVALID_CREDENTIAL_ID",

            message:
                error.message

        });

    }


    // ==================================================
    // Invalid Admin
    // ==================================================

    if (
        error.message ===
        "Invalid admin."
    ) {

        return res.status(401).json({

            success: false,

            code:
                "INVALID_ADMIN_CONTEXT",

            message:
                "Invalid admin authentication context."

        });

    }


    // ==================================================
    // Merchant Not Found
    // ==================================================

    if (
        error.message ===
        "Merchant not found."
    ) {

        return res.status(404).json({

            success: false,

            code:
                "MERCHANT_NOT_FOUND",

            message:
                error.message

        });

    }


    // ==================================================
    // Credential Not Found
    // ==================================================

    if (
        error.message ===
        "API credential not found."
    ) {

        return res.status(404).json({

            success: false,

            code:
                "API_CREDENTIAL_NOT_FOUND",

            message:
                error.message

        });

    }


    // ==================================================
    // Credentials Already Exist
    // ==================================================

    if (
        error.message.includes(
            "credentials already exist"
        )
    ) {

        return res.status(409).json({

            success: false,

            code:
                "API_CREDENTIAL_ALREADY_EXISTS",

            message:
                error.message

        });

    }


    // ==================================================
    // Already Revoked
    // ==================================================

    if (
        error.message ===
        "API credential is already revoked."
    ) {

        return res.status(409).json({

            success: false,

            code:
                "API_CREDENTIAL_ALREADY_REVOKED",

            message:
                error.message

        });

    }


    // ==================================================
    // Cannot Regenerate Revoked
    // ==================================================

    if (
        error.message ===
        "Revoked API credentials cannot be regenerated."
    ) {

        return res.status(409).json({

            success: false,

            code:
                "API_CREDENTIAL_REVOKED",

            message:
                error.message

        });

    }


    // ==================================================
    // Cannot Modify Revoked
    // ==================================================

    if (
        error.message ===
        "Revoked API credentials cannot be modified."
    ) {

        return res.status(409).json({

            success: false,

            code:
                "API_CREDENTIAL_REVOKED",

            message:
                error.message

        });

    }


    // ==================================================
    // State Conflict
    // ==================================================

    if (
        error.message.includes(
            "already"
        )
    ) {

        return res.status(409).json({

            success: false,

            code:
                "API_CREDENTIAL_STATE_CONFLICT",

            message:
                error.message

        });

    }


    // ==================================================
    // Merchant Eligibility
    // ==================================================

    if (
        error.message ===
            "Merchant is not approved." ||
        error.message ===
            "Merchant KYC is not approved."
    ) {

        return res.status(403).json({

            success: false,

            code:
                "MERCHANT_NOT_ELIGIBLE",

            message:
                error.message

        });

    }


    // ==================================================
    // Merchant Account
    // ==================================================

    if (
        error.message ===
        "Merchant account is not active."
    ) {

        return res.status(403).json({

            success: false,

            code:
                "MERCHANT_ACCOUNT_NOT_ACTIVE",

            message:
                error.message

        });

    }


    // ==================================================
    // API Credential Update Errors
    // ==================================================

    if (
        error.message ===
            "Failed to update API credential status." ||
        error.message ===
            "Failed to revoke API credential." ||
        error.message ===
            "Failed to inactivate old API credential." ||
        error.message ===
            "Failed to create regenerated API credential." ||
        error.message ===
            "Failed to create API credentials."
    ) {

        return res.status(500).json({

            success: false,

            code:
                "API_CREDENTIAL_OPERATION_FAILED",

            message:
                error.message

        });

    }


    // ==================================================
    // Unknown Error
    // ==================================================

    next(error);

};


// ==========================================================
// Exports
// ==========================================================

module.exports = {

    createApiCredentials,

    getApiCredentialsController,

    updateApiCredentialStatus,

    regenerateApiCredentialsController,

    revokeApiCredentialController

};