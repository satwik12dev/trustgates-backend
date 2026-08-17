const cancelRefundRequestService = require(
    "../../../services/refund/request/cancelRefundRequest.service"
);


// ==========================================================
// Cancel Refund Request Controller
// ==========================================================

const cancelRefundRequestController = async (

    req,

    res,

    next

) => {

    try {


        const userId = req.user.merchant_id;


        const requestId = req.params.requestId;


        const {

            remarks

        } = req.body;



        const result = await cancelRefundRequestService(

            {

                requestId,

                cancelledBy: userId,

                remarks

            }

        );



        return res.status(200).json({

            success: true,

            message:

                "Refund request cancelled successfully.",

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

    cancelRefundRequestController

};