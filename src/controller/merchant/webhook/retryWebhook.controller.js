const retryWebhookService = require(
    "../../../services/merchant/webhook/retryWebhook.service"
);


const retryWebhook = async(req,res)=>{

    try{

        const merchantId =
            req.user.merchantId;


        const logId =
            req.params.logId;



        const result =
            await retryWebhookService({

                merchantId,

                logId

            });



        return res.status(200).json({

            success:true,

            message:
            "Webhook retry queued successfully.",

            data:result

        });


    }
    catch(error){

        console.log(
            "Retry Webhook Error:",
            error.message
        );


        return res.status(400).json({

            success:false,

            message:error.message

        });

    }

};


module.exports = retryWebhook;