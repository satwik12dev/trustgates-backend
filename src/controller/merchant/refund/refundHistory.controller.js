const refundHistoryService = require(
    "../../../services/merchant/refund/refundHistory.service"
);


const refundHistoryValidation = require(
    "../../../validations/merchant/refund/refundHistory.validation"
);


const {
    validationResult
} = require(
    "express-validator"
);



// ==========================================================
// Refund History Controller
// ==========================================================

const refundHistory = async (

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



        const result = await refundHistoryService(

            merchantId,

            req.query

        );



        return res.status(200).json(

            result

        );


    }

    catch(error){


        console.error(

            "Refund History Controller Error:",

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

    refundHistory

};