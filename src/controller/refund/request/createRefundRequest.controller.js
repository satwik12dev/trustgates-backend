const createRefundRequestService = require(
    "../../../services/refund/request/createRefundRequest.service"
);


// ==========================================================
// Create Refund Request Controller
// ==========================================================

const createRefundRequestController = async (

    req,

    res,

    next

) => {

    try {


        const merchantId = req.merchant.merchant_id;


        const result = await createRefundRequestService(

            merchantId,

            req.body

        );


        return res.status(201).json({

            success: true,

            message:

                "Refund request created successfully.",

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

    createRefundRequestController

};