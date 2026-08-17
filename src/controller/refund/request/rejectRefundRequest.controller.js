const rejectRefundRequestService = require(
    "../../../services/refund/request/rejectRefundRequest.service"
);


// ==========================================================
// Reject Refund Request Controller
// ==========================================================

const rejectRefundRequestController = async (

    req,

    res,

    next

) => {

    try {

        const {
            remarks,
        } = req.body;
        const merchantId = req.user.merchant_id;
        const requestId = req.params.requestId;

        const result = await rejectRefundRequestService(
            merchantId,
            requestId,
            {
                remarks
            }
        );

        return res.status(200).json({
            success: true,
            message:

                "Refund request rejected successfully.",

            data: result

        });


    }

    catch (

    error

    ) {

        next(error);

    }

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    rejectRefundRequestController

};