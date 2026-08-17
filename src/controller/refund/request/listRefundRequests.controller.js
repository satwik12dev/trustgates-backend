const listRefundRequestsService = require(
    "../../../services/refund/request/listRefundRequests.service"
);


// ==========================================================
// List Refund Requests Controller
// ==========================================================

const listRefundRequestsController = async (

    req,

    res,

    next

) => {

    try {


        const merchantId = req.merchant.merchant_id;


        const page = Number(

            req.query.page || 1

        );


        const limit = Number(

            req.query.limit || 20

        );


        const result = await listRefundRequestsService(

            merchantId,

            {

                page,

                limit

            }

        );


        return res.status(200).json({

            success: true,

            message:

                "Refund requests fetched successfully.",

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

    listRefundRequestsController

};