const AUDIT_ACTIONS = Object.freeze({

    // ==========================================
    // Admin Authentication
    // ==========================================

    ADMIN_LOGIN:
        "ADMIN_LOGIN",

    ADMIN_LOGIN_FAILED:
        "ADMIN_LOGIN_FAILED",

    ADMIN_REFRESH_TOKEN:
        "ADMIN_REFRESH_TOKEN",

    ADMIN_LOGOUT:
        "ADMIN_LOGOUT",

    ADMIN_LOGOUT_ALL:
        "ADMIN_LOGOUT_ALL",

    ADMIN_PASSWORD_CHANGED:
        "ADMIN_PASSWORD_CHANGED",

    ADMIN_PASSWORD_RESET:
        "ADMIN_PASSWORD_RESET",

    ADMIN_PASSWORD_RESET_FAILED:
        "ADMIN_PASSWORD_RESET_FAILED",


    // ==========================================
    // Merchant Management
    // ==========================================

    MERCHANT_CREATED:
        "MERCHANT_CREATED",

    MERCHANT_VIEWED:
        "MERCHANT_VIEWED",

    MERCHANT_LIST_VIEWED:
        "MERCHANT_LIST_VIEWED",

    MERCHANT_UPDATED:
        "MERCHANT_UPDATED",

    MERCHANT_DELETED:
        "MERCHANT_DELETED",

    MERCHANT_APPROVED:
        "MERCHANT_APPROVED",

    MERCHANT_REJECTED:
        "MERCHANT_REJECTED",

    MERCHANT_STATUS_CHANGED:
        "MERCHANT_STATUS_CHANGED",


    // ==========================================
    // Merchant KYC
    // ==========================================

    KYC_UPLOADED:
        "KYC_UPLOADED",

    KYC_VIEWED:
        "KYC_VIEWED",

    KYC_APPROVED:
        "KYC_APPROVED",

    KYC_REJECTED:
        "KYC_REJECTED",

    KYC_RESUBMISSION_ALLOWED:
        "KYC_RESUBMISSION_ALLOWED",

    KYC_VERIFICATION_FAILED:
        "KYC_VERIFICATION_FAILED",


    // ==========================================
    // API Credentials
    // ==========================================

    API_CREDENTIAL_CREATED:
        "API_CREDENTIAL_CREATED",

    API_CREDENTIAL_VIEWED:
        "API_CREDENTIAL_VIEWED",

    API_CREDENTIAL_REGENERATED:
        "API_CREDENTIAL_REGENERATED",

    API_CREDENTIAL_REVOKED:
        "API_CREDENTIAL_REVOKED",

    API_CREDENTIAL_STATUS_CHANGED:
        "API_CREDENTIAL_STATUS_CHANGED",


    // ==========================================
    // IP Whitelist
    // ==========================================

    IP_WHITELIST_UPDATED:
        "IP_WHITELIST_UPDATED",

    IP_WHITELIST_ADDED:
        "IP_WHITELIST_ADDED",

    IP_WHITELIST_REMOVED:
        "IP_WHITELIST_REMOVED",


    // ==========================================
    // Merchant Account
    // ==========================================

    MERCHANT_ACCOUNT_ACTIVATED:
        "MERCHANT_ACCOUNT_ACTIVATED",

    MERCHANT_ACCOUNT_SUSPENDED:
        "MERCHANT_ACCOUNT_SUSPENDED",

    MERCHANT_ACCOUNT_BLOCKED:
        "MERCHANT_ACCOUNT_BLOCKED",

    MERCHANT_ACCOUNT_STATUS_CHANGED:
        "MERCHANT_ACCOUNT_STATUS_CHANGED"

});


const AUDIT_ENTITY_TYPES = Object.freeze({

    ADMIN:
        "ADMIN",

    MERCHANT:
        "MERCHANT",

    KYC:
        "KYC",

    API_CREDENTIAL:
        "API_CREDENTIAL",

    IP_WHITELIST:
        "IP_WHITELIST"

});


const AUDIT_STATUS = Object.freeze({

    SUCCESS:
        "SUCCESS",

    FAILED:
        "FAILED"

});


module.exports = {
    AUDIT_ACTIONS,
    AUDIT_ENTITY_TYPES,
    AUDIT_STATUS
};