const pool = require("../../../config/pool");

const {

    listRefundRequests,

    countRefundRequests

} = require("../helpers/request/refundRequest.helper");

const {

    buildRefundRequestListResponse

} = require("../helpers/request/response.helper");

// ==========================================================
// List Refund Requests
// ==========================================================

const listRefundRequestsService = async (

    merchantId,

    page,

    limit

) => {

    const connection = await pool.getConnection();

    try {

        // ==================================================
        // Pagination
        // ==================================================

        const currentPage = Number(

            page || 1

        );

        const pageLimit = Number(

            limit || 10

        );

        const offset = (

            currentPage - 1

        ) * pageLimit;

        // ==================================================
        // Get Requests
        // ==================================================

        const requests = await listRefundRequests(

            connection,

            merchantId,

            pageLimit,

            offset

        );

        // ==================================================
        // Total Records
        // ==================================================

        const total = await countRefundRequests(

            connection,

            merchantId

        );

        // ==================================================
        // Response
        // ==================================================

        return buildRefundRequestListResponse(

            requests,

            total,

            currentPage,

            pageLimit

        );

    }

    finally {

        connection.release();

    }

};

// ==========================================================
// Export
// ==========================================================

module.exports = listRefundRequestsService;