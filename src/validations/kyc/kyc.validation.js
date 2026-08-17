const ApiError = require("../../utils/kyc/APIError");

// ==========================================
// Validate PAN & Aadhaar Details
// ==========================================
const validateKyc = (req) => {
    const {merchantID} = req.params;
    const { pan_number, aadhaar_number } = req.body;

    // ============================
    // Required Fields
    // ============================

    if (!pan_number || !pan_number.trim()) {
        throw new ApiError(400, "PAN number is required.");
    }

    if (!aadhaar_number || !aadhaar_number.trim()) {
        throw new ApiError(400, "Aadhaar number is required.");
    }

    // ============================
    // PAN Validation
    // Format: ABCDE1234F
    // ============================

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!panRegex.test(pan_number.toUpperCase())) {
        throw new ApiError(400, "Invalid PAN number.");
    }

    // ============================
    // Aadhaar Validation
    // 12 Digits
    // ============================

    const aadhaarRegex = /^[0-9]{12}$/;

    if (!aadhaarRegex.test(aadhaar_number)) {
        throw new ApiError(400, "Invalid Aadhaar number.");
    }

    // ============================
    // File Validation
    // ============================

    if (!req.files?.pan_document?.length) {
        throw new ApiError(400, "PAN document is required.");
    }

    if (!req.files?.aadhaar_document?.length) {
        throw new ApiError(400, "Aadhaar document is required.");
    }

    return {
        pan_number: pan_number.toUpperCase().trim(),
        aadhaar_number: aadhaar_number.trim()
    };
};

module.exports = validateKyc;