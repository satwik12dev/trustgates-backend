const { randomUUID } = require("crypto");

// ==========================================================
// Generate Refund Reference
// ==========================================================

const generateRefundReference = () => {

    return `RFD_${randomUUID()}`;

};


// ==========================================================
// Export
// ==========================================================

module.exports = generateRefundReference
