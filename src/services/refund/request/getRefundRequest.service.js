const pool = require("../../../config/pool");

const {

    getRefundRequestByReference

} = require("../helpers/request/refundRequest.helper");

const {

    validateRequestOwnership

} = require("../helpers/request/validaiton.helper");

const {

    buildRefundRequestResponse

} = require("../helpers/request/response.helper");

// ==========================================================
// Get Refund Request
// ==========================================================

const getRefundRequestService = async (

    merchantId,

    requestReference

) => {

    const connection = await pool.getConnection();

    try {

        // ==================================================
        // Get Refund Request
        // ==================================================

        const refundRequest = await getRefundRequestByReference(

            connection,

            requestReference

        );

        // ==================================================
        // Validate Ownership
        // ==================================================

        validateRequestOwnership(

            merchantId,

            refundRequest

        );

        // ==================================================
        // Response
        // ==================================================

        return buildRefundRequestResponse(

            refundRequest

        );

    }

    finally {

        connection.release();

    }

};

// ==========================================================
// Export
// ==========================================================

module.exports = getRefundRequestService;