const getRefundRequestService = require(
    "../../../services/refund/request/getRefundRequest.service"
);


// ==========================================================
// Get Refund Request Controller
// ==========================================================

const getRefundRequestController = async (

    req,

    res,

    next

) => {

    try {


        const merchantId = req.merchant.merchant_id;


        const requestId = req.params.requestId;


        const result = await getRefundRequestService(

            merchantId,

            requestId

        );


        return res.status(200).json({

            success: true,

            message:

                "Refund request fetched successfully.",

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

    getRefundRequestController

};