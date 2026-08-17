const paymentHistoryService = require(
    "../../../services/merchant/payment/paymentHistory.service"
);



// ==========================================================
// Payment History Controller
// ==========================================================

const paymentHistory = async (

    req,

    res,

    next

) => {


    try {


        const merchantId =

            req.user.merchant_id;



        const filters = {


            page:

                req.query.page,


            limit:

                req.query.limit,


            status:

                req.query.status,


            payment_method:

                req.query.payment_method,


            payment_type:

                req.query.payment_type,


            start_date:

                req.query.start_date,


            end_date:

                req.query.end_date


        };



        const result = await paymentHistoryService(

            merchantId,

            filters

        );



        return res.status(200).json(

            result

        );


    }

    catch(error){


        console.error(

            "Payment History Controller Error:",

            error

        );


        next(error);


    }


};



module.exports = {

    paymentHistory

};