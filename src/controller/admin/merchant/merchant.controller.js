const {
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
} = require("../../../services/admin/merchant/merchant.service");


const {
    createMerchantValidation,
    merchantIdValidation,
    updateAccountStatusValidation,
    updateMerchantValidation,
    generateApiCredentialValidation
} = require(
    "../../../validations/admin/merchant/merchant.validations"
);


const {
    uploadMerchantKycValidation
} = require(
    "../../../validations/admin/merchant/merchantKyc.validation"
);


// ==========================================================
// EMAIL SERVICES
// ==========================================================

const sendKycReceivedEmail =
    require(
        "../../../services/kyc/sendKycReceivedEmail"
    );

const sendApiCredentialsEmail =
    require(
        "../../../services/email/sendApiCredentialsEmail"
    );

const sendAccountStatusEmail =
    require(
        "../../../services/email/sendAccountStatusEmail"
    );

const sendMerchantWelcomeEmail =
    require(
        "../../../services/email/sendMerchantWelcomeEmail"
    );

const sendMerchantApprovedEmail =
    require(
        "../../../services/email/sendMerchantApprovedEmail"
    );


// ==========================================================
// CREATE MERCHANT
// ==========================================================

const createMerchantController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication Check
        // ==================================================

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authentication is required."

            });

        }


        // ==================================================
        // Validate Admin ID
        // ==================================================

        const adminId =
            Number(
                req.admin.admin_id
            );


        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin authentication."

            });

        }


        // ==================================================
        // Validate Request Body
        // ==================================================

        const validatedData =
            await createMerchantValidation.validateAsync(

                req.body,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Audit Context
        // ==================================================

        const auditContext = {

            adminId,

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==================================================
        // Create Merchant
        // ==================================================

        const result =
            await createMerchant(

                validatedData,

                auditContext

            );


        // ==================================================
        // Welcome Email
        //
        // Email failure does NOT rollback merchant creation.
        // ==================================================

        if (
            result.success &&
            result.data
        ) {

            sendMerchantWelcomeEmail(

                result.data.merchantName,

                result.data.email

            ).catch(error => {

                console.error(

                    "Merchant Welcome Email Error:",

                    error.message

                );

            });

        }


        // ==================================================
        // Response
        // ==================================================

        return res

            .status(
                result.statusCode
            )

            .json(
                result
            );


    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GET MERCHANT LIST
// ==========================================================

const getMerchantListController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication Check
        // ==================================================

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authentication is required."

            });

        }


        // ==================================================
        // Validate Admin ID
        // ==================================================

        const adminId =
            Number(
                req.admin.admin_id
            );


        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin authentication."

            });

        }


        // ==================================================
        // Audit Context
        // ==================================================

        const auditContext = {

            adminId,

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==================================================
        // Get Merchant List
        // ==================================================

        const result =
            await getMerchantList(

                req.query,

                auditContext

            );


        // ==================================================
        // Response
        // ==================================================

        return res

            .status(
                result.statusCode || 200
            )

            .json(
                result
            );


    } catch (error) {

        next(error);

    }

};

// ==========================================================
// GET MERCHANT BY ID
// ==========================================================

const getMerchantByIdController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication
        // ==================================================

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authentication is required."

            });

        }


        // ==================================================
        // Admin ID
        // ==================================================

        const adminId =
            Number(
                req.admin.admin_id
            );


        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin authentication."

            });

        }


        // ==================================================
        // Merchant ID
        // ==================================================

        const merchantId =
            req.params.merchantId;


        // ==================================================
        // Audit Context
        // ==================================================

        const auditContext = {

            adminId,

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==================================================
        // Get Merchant
        // ==================================================

        const result =
            await getMerchantById(

                merchantId,

                auditContext

            );


        // ==================================================
        // Response
        // ==================================================

        return res

            .status(
                result.statusCode || 200
            )

            .json(
                result
            );


    } catch (error) {

        next(error);

    }

};


// ==========================================================
// UPDATE MERCHANT
// ==========================================================

const updateMerchantController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication Check
        // ==================================================

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authentication is required."

            });

        }


        // ==================================================
        // Validate Admin ID
        // ==================================================

        const adminId =
            Number(
                req.admin.admin_id
            );


        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin authentication."

            });

        }


        // ==================================================
        // Validate Merchant ID
        // ==================================================

        const {
            merchantId
        } =
            await merchantIdValidation.validateAsync(

                req.params,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Validate Request Body
        // ==================================================

        const validatedData =
            await updateMerchantValidation.validateAsync(

                req.body,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Audit Context
        // ==================================================

        const auditContext = {

            adminId,

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==================================================
        // Update Merchant
        // ==================================================

        const result =
            await updateMerchant(

                merchantId,

                validatedData,

                auditContext

            );


        // ==================================================
        // Response
        // ==================================================

        return res

            .status(
                result.statusCode
            )

            .json(
                result
            );


    } catch (error) {

        next(error);

    }

};


// ==========================================================
// DELETE MERCHANT
// ==========================================================

const deleteMerchantController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication Check
        // ==================================================

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authentication is required."

            });

        }


        // ==================================================
        // Validate Admin ID
        // ==================================================

        const adminId =
            Number(
                req.admin.admin_id
            );


        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin authentication."

            });

        }


        // ==================================================
        // Validate Merchant ID
        // ==================================================

        const {
            merchantId
        } =
            await merchantIdValidation.validateAsync(

                req.params,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Audit Context
        // ==================================================

        const auditContext = {

            adminId,

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==================================================
        // Delete Merchant
        // ==================================================

        const result =
            await deleteMerchant(

                merchantId,

                auditContext

            );


        // ==================================================
        // Response
        // ==================================================

        return res

            .status(
                result.statusCode
            )

            .json(
                result
            );


    } catch (error) {

        next(error);

    }

};


// ==========================================================
// UPLOAD / RESUBMIT MERCHANT KYC
// ==========================================================

const uploadMerchantKycController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Validate Merchant ID
        // ==================================================

        const {
            merchantId
        } =
            await merchantIdValidation.validateAsync(

                req.params,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Validate KYC Data
        // ==================================================

        const validatedData =
            await uploadMerchantKycValidation.validateAsync(

                req.body,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Files
        // ==================================================

        const files =
            req.files;


        // ==================================================
        // Audit Context
        // ==================================================
        //
        // This is a MERCHANT action.
        // adminId remains null here.
        //
        // ==================================================

        const auditContext = {

            adminId: null,

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==================================================
        // Upload KYC
        // ==================================================

        const result =
            await uploadMerchantKyc(

                merchantId,

                validatedData,

                files,

                auditContext

            );


        // ==================================================
        // Response
        // ==================================================

        return res

            .status(
                result.statusCode
            )

            .json(
                result
            );


    } catch (error) {

        next(error);

    }

};


// ==========================================================
// APPROVE MERCHANT
// ==========================================================

const approveMerchantController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication Check
        // ==================================================

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authentication is required."

            });

        }


        // ==================================================
        // Validate Admin ID
        // ==================================================

        const adminId =
            Number(
                req.admin.admin_id
            );


        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin authentication."

            });

        }


        // ==================================================
        // Validate Merchant ID
        // ==================================================

        const {
            merchantId
        } =
            await merchantIdValidation.validateAsync(

                req.params,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Audit Context
        // ==================================================

        const auditContext = {

            adminId,

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==================================================
        // Approve Merchant
        // ==================================================

        const result =
            await approveMerchant(

                merchantId,

                auditContext

            );


        // ==================================================
        // Response
        // ==================================================

        return res

            .status(
                result.statusCode
            )

            .json(
                result
            );


    } catch (error) {

        next(error);

    }

};


// ==========================================================
// KYC APPROVE / REJECT
// ==========================================================

const approveMerchantKycController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication Check
        // ==================================================

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authentication is required."

            });

        }


        // ==================================================
        // Validate Admin ID
        // ==================================================

        const adminId =
            Number(
                req.admin.admin_id
            );


        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin authentication."

            });

        }


        // ==================================================
        // Validate Merchant ID
        // ==================================================

        const {
            merchantId
        } =
            await merchantIdValidation.validateAsync(

                req.params,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Validate KYC Request
        // ==================================================

        const validatedData =
            await approveMerchantKycValidation.validateAsync(

                req.body,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        const {
            kycStatus,
            verificationNotes
        } = validatedData;


        // ==================================================
        // Audit Context
        // ==================================================

        const auditContext = {

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==================================================
        // Approve / Reject Merchant KYC
        // ==================================================

        const result =
            await approveMerchantKyc(

                merchantId,

                kycStatus,

                verificationNotes,

                adminId,

                auditContext

            );


        // ==================================================
        // Response
        // ==================================================

        return res

            .status(
                result.statusCode
            )

            .json(
                result
            );


    } catch (error) {

        next(error);

    }

};

// ==========================================================
// ALLOW KYC RESUBMISSION
// ==========================================================

const allowKycResubmissionController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication Check
        // ==================================================

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authentication is required."

            });

        }


        // ==================================================
        // Validate Admin ID
        // ==================================================

        const adminId =
            Number(
                req.admin.admin_id
            );


        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin authentication."

            });

        }


        // ==================================================
        // Validate Merchant ID
        // ==================================================

        const {
            merchantId
        } =
            await merchantIdValidation.validateAsync(

                req.params,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Audit Context
        // ==================================================

        const auditContext = {

            adminId,

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==================================================
        // Allow KYC Resubmission
        // ==================================================

        const result =
            await allowKycResubmission(

                merchantId,

                auditContext

            );


        // ==================================================
        // Response
        // ==================================================

        return res

            .status(
                result.statusCode
            )

            .json(
                result
            );


    } catch (error) {

        next(error);

    }

};


// ==========================================================
// GENERATE API CREDENTIALS
// ==========================================================

const generateApiCredentialsController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication Check
        // ==================================================

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authentication is required."

            });

        }


        // ==================================================
        // Validate Admin ID
        // ==================================================

        const adminId =
            Number(
                req.admin.admin_id
            );


        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin authentication."

            });

        }


        // ==================================================
        // Validate Merchant ID
        // ==================================================

        const {
            merchantId
        } =
            await merchantIdValidation.validateAsync(

                req.params,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Validate Request Body
        // ==================================================

        const validatedData =
            await generateApiCredentialsValidation.validateAsync(

                req.body,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Audit Context
        // ==================================================

        const auditContext = {

            adminId,

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==================================================
        // Generate API Credentials
        // ==================================================

        const result =
            await generateApiCredentials(

                merchantId,

                validatedData,

                auditContext

            );


        // ==================================================
        // Response
        // ==================================================

        return res

            .status(
                result.statusCode
            )

            .json(
                result
            );


    } catch (error) {

        next(error);

    }

};

// ==========================================================
// UPDATE ACCOUNT STATUS
// ==========================================================

const updateAccountStatusController = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // Admin Authentication Check
        // ==================================================

        if (
            !req.admin ||
            !req.admin.admin_id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authentication is required."

            });

        }


        // ==================================================
        // Validate Admin ID
        // ==================================================

        const adminId =
            Number(
                req.admin.admin_id
            );


        if (
            !Number.isInteger(adminId) ||
            adminId <= 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin authentication."

            });

        }


        // ==================================================
        // Validate Merchant ID
        // ==================================================

        const {
            merchantId
        } =
            await merchantIdValidation.validateAsync(

                req.params,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Validate Account Status
        // ==================================================

        const {
            accountStatus
        } =
            await updateAccountStatusValidation.validateAsync(

                req.body,

                {
                    abortEarly: true,
                    stripUnknown: true
                }

            );


        // ==================================================
        // Audit Context
        // ==================================================

        const auditContext = {

            adminId,

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.headers["user-agent"] ||
                null,

            requestId:
                req.id ||
                req.headers["x-request-id"] ||
                null

        };


        // ==================================================
        // Update Account Status
        // ==================================================

        const result =
            await updateAccountStatus(

                merchantId,

                accountStatus,

                auditContext

            );


        // ==================================================
        // Response
        // ==================================================

        return res

            .status(
                result.statusCode
            )

            .json(
                result
            );


    } catch (error) {

        next(error);

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    createMerchantController,

    getMerchantListController,

    getMerchantByIdController,

    updateMerchantController,

    deleteMerchantController,

    uploadMerchantKycController,

    approveMerchantController,

    approveMerchantKycController,

    allowKycResubmissionController,

    generateApiCredentialsController,

    updateAccountStatusController

};