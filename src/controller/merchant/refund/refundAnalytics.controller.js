const refundAnalyticsService = require(
    "../../../services/merchant/refund/refundAnalytics.service"
);


const refundAnalyticsValidation = require(
    "../../../validations/merchant/refund/refundAnalytics.validation"
);


const {
    validationResult
} = require(
    "express-validator"
);



// ==========================================================
// Refund Analytics Controller
// ==========================================================

const refundAnalytics = async (

    req,

    res

) => {


    try {


        const errors = validationResult(req);



        if(!errors.isEmpty()){


            return res.status(400).json({

                success:false,

                message:
                    "Validation failed.",

                errors:
                    errors.array()

            });


        }



        const merchantId =

            req.user.merchant_id;



        const result = await refundAnalyticsService(

            merchantId

        );



        return res.status(200).json(

            result

        );


    }


    catch(error){


        console.error(

            "Refund Analytics Controller Error:",

            error

        );



        return res.status(500).json({

            success:false,

            message:
                "Internal Server Error."

        });


    }


};



module.exports = {

    refundAnalytics

};