const approveRefundRequestService = require(
    "../../../services/refund/request/approveRefundRequest.service"
);


// ==========================================================
// Approve Refund Request Controller
// ==========================================================

const approveRefundRequestController = async (

    req,

    res,

    next

) => {

    try {

        const requestId = req.params.requestId;


        const {

            approvedAmount,

            remarks

        } = req.body;



        const result = await approveRefundRequestService({

            merchantId: req.user.merchant_id,

            requestId,

            approvedAmount,

            remarks

        });



        return res.status(200).json({

            success: true,

            message:

                "Refund request approved successfully.",

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

    approveRefundRequestController

};