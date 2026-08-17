const paymentStatusService = require(
    "../../../services/merchant/payment/paymentStatus.service"
);


const paymentStatusValidation = require(
    "../../../validations/merchant/payment/paymentStatus.validation"
);


const {
    validationResult
} = require(
    "express-validator"
);



// ==========================================================
// Payment Status Controller
// ==========================================================

const paymentStatus = async (

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

            req.merchant.merchant_id;



        const transactionRef =

            req.params.transactionRef;



        const result = await paymentStatusService(

            merchantId,

            transactionRef

        );



        if(!result.success){


            return res.status(404).json(

                result

            );


        }



        return res.status(200).json(

            result

        );


    }


    catch(error){


        console.error(

            "Payment Status Controller Error:",

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

    paymentStatus

};