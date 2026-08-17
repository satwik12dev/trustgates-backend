const refundService = require(
    "../../../services/merchant/dashboard/refund.service"
);



// ==========================================================
// Dashboard Refund Controller
// ==========================================================

const refundOverview = async (

    req,

    res,

    next

) => {


    try {


        const merchantId =

            req.user.merchant_id;



        const result = await refundService(

            merchantId

        );



        return res.status(200).json(

            result

        );


    }

    catch(error){


        console.error(
            "Dashboard Refund Error:",
            error
        );


        next(error);


    }


};



module.exports = {

    refundOverview

};