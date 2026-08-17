const {
    getRefundStatusService
} = require(
    "../../../services/refund/status/getRefundStatus.service"
);


const getRefundStatusController = async (
    req,
    res,
    next
) => {

    try {


        const result = await getRefundStatusService(

            req.params.transactionRef

        );


        return res.json({

            success:true,

            data:result

        });


    }
    catch(error){

        next(error);

    }

};



module.exports = {

    getRefundStatusController

};