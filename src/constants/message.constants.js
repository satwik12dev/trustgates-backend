// ==========================================================
// Common Messages
// ==========================================================

const MESSAGE = Object.freeze({

    // ======================================================
    // Success
    // ======================================================

    SUCCESS: "Request completed successfully.",

    CREATED: "Resource created successfully.",

    UPDATED: "Resource updated successfully.",

    DELETED: "Resource deleted successfully.",

    FETCHED: "Data fetched successfully.",

    // ======================================================
    // Authentication
    // ======================================================

    LOGIN_SUCCESS: "Login successful.",

    LOGOUT_SUCCESS: "Logout successful.",

    INVALID_CREDENTIALS: "Invalid credentials.",

    INVALID_API_CREDENTIALS: "Invalid API credentials.",

    API_CREDENTIALS_REQUIRED: "API credentials are required.",

    API_KEY_REQUIRED: "API key is required.",

    API_SECRET_REQUIRED: "API secret is required.",

    UNAUTHORIZED: "Unauthorized access.",

    SESSION_EXPIRED: "Session expired. Please login again.",

    ACCESS_DENIED: "Access denied.",

    // ======================================================
    // Merchant
    // ======================================================

    MERCHANT_NOT_FOUND: "Merchant not found.",

    MERCHANT_ALREADY_EXISTS: "Merchant already exists.",

    MERCHANT_INACTIVE: "Merchant account is inactive.",

    MERCHANT_SUSPENDED: "Merchant account is suspended.",

    EMAIL_NOT_VERIFIED: "Merchant email is not verified.",

    KYC_NOT_APPROVED: "Merchant KYC is not approved.",

    // ======================================================
    // API Credentials
    // ======================================================

    API_CREDENTIAL_NOT_FOUND: "API credential not found.",

    API_CREDENTIAL_INACTIVE: "API credential is inactive.",

    API_KEY_GENERATED: "API credentials generated successfully.",

    API_KEY_REGENERATED: "API credentials regenerated successfully.",

    API_KEY_REVOKED: "API credential revoked successfully.",

    // ======================================================
    // IP Whitelist
    // ======================================================

    IP_NOT_WHITELISTED: "IP address is not whitelisted.",

    IP_ALREADY_EXISTS: "IP address already exists.",

    IP_ADDED: "IP address added successfully.",

    IP_UPDATED: "IP address updated successfully.",

    IP_REMOVED: "IP address removed successfully.",

    // ======================================================
    // Payment Methods
    // ======================================================

    PAYMENT_METHOD_NOT_FOUND: "Payment method not found.",

    PAYMENT_METHOD_DISABLED: "Payment method is disabled.",

    PAYMENT_METHOD_UPDATED: "Payment method updated successfully.",

    // ======================================================
    // Payment
    // ======================================================

    ORDER_CREATED: "Payment order created successfully.",

    PAYMENT_SUCCESS: "Payment completed successfully.",

    PAYMENT_PENDING: "Payment is pending.",

    PAYMENT_FAILED: "Payment failed.",

    PAYMENT_NOT_FOUND: "Payment not found.",

    PAYMENT_ALREADY_CAPTURED: "Payment already captured.",

    INVALID_PAYMENT_SIGNATURE: "Invalid payment signature.",

    // ======================================================
    // Refund
    // ======================================================

    REFUND_CREATED: "Refund initiated successfully.",

    REFUND_SUCCESS: "Refund processed successfully.",

    REFUND_FAILED: "Refund failed.",

    REFUND_NOT_FOUND: "Refund not found.",

    // ======================================================
    // Payout
    // ======================================================

    PAYOUT_CREATED: "Payout created successfully.",

    PAYOUT_SUCCESS: "Payout completed successfully.",

    PAYOUT_FAILED: "Payout failed.",

    PAYOUT_NOT_FOUND: "Payout not found.",

    BENEFICIARY_CREATED: "Beneficiary created successfully.",

    BENEFICIARY_UPDATED: "Beneficiary updated successfully.",

    BENEFICIARY_NOT_FOUND: "Beneficiary not found.",

    // ======================================================
    // Transaction
    // ======================================================

    TRANSACTION_NOT_FOUND: "Transaction not found.",

    TRANSACTION_FETCHED: "Transaction fetched successfully.",

    TRANSACTIONS_FETCHED: "Transactions fetched successfully.",

    // ======================================================
    // Settlement
    // ======================================================

    SETTLEMENT_PENDING: "Settlement is pending.",

    SETTLEMENT_COMPLETED: "Settlement completed successfully.",

    // ======================================================
    // Webhook
    // ======================================================

    WEBHOOK_RECEIVED: "Webhook received successfully.",

    INVALID_WEBHOOK_SIGNATURE: "Invalid webhook signature.",

    // ======================================================
    // Validation
    // ======================================================

    VALIDATION_FAILED: "Validation failed.",

    INVALID_REQUEST: "Invalid request.",

    REQUIRED_FIELDS_MISSING: "Required fields are missing.",

    // ======================================================
    // Rate Limiting
    // ======================================================

    TOO_MANY_REQUESTS: "Too many requests. Please try again later.",

    DUPLICATE_REQUEST: "Duplicate request detected.",

    // ======================================================
    // Server
    // ======================================================

    INTERNAL_SERVER_ERROR: "Internal server error.",

    SERVICE_UNAVAILABLE: "Service temporarily unavailable."

});

// ==========================================================
// Export
// ==========================================================

module.exports = {

    MESSAGE

};