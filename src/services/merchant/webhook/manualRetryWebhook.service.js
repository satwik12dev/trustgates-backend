const pool = require(
    "../../../config/pool"
);


const webhookRetryQueue = require(
    "../../../queues/webhook.retry.queue"
);


const validateRetryWebhook = require(
    "../../../validations/merchant/webhook/retryWebhook.validation"
);



const manualRetryWebhookService = async({

    merchantId,

    logId

})=>{


    validateRetryWebhook(logId);



    const connection =
        await pool.getConnection();



    try{


        const [logs] =
        await connection.query(

`
SELECT

log_id,

delivery_status,

retry_status,

retry_count,

max_retry


FROM merchant_webhook_logs


WHERE log_id = ?

AND merchant_id = ?

LIMIT 1

`,

[

logId,

merchantId

]

);



        if(!logs.length){

            throw new Error(
                "Webhook log not found."
            );

        }



        const webhookLog =
            logs[0];



        // Already success

        if(
            webhookLog.delivery_status === "SUCCESS"
        ){

            throw new Error(
                "Webhook already delivered."
            );

        }



        // Retry limit check

        if(

            webhookLog.retry_count >=

            webhookLog.max_retry

        ){

            throw new Error(
                "Maximum retry limit reached."
            );

        }



        await webhookRetryQueue.add(

            "retry-webhook",

            {

                webhookLogId:
                webhookLog.log_id

            },

            {

                attempts:5,

                backoff:{

                    type:"exponential",

                    delay:60000

                },


                removeOnComplete:true,

                removeOnFail:false

            }

        );



        await connection.query(

`
UPDATE merchant_webhook_logs

SET

retry_status='PENDING',

next_retry_at=NOW()

WHERE log_id=?

`,

[logId]

);



        return {


            logId:


            webhookLog.log_id,


            status:

            "QUEUED"


        };


    }

    finally{


        connection.release();

    }


};



module.exports = manualRetryWebhookService;