const axios = require("axios");

const pool = require(
    "../../../config/pool"
);

const LOG_QUERIES = require(
    "../../../queries/merchant/webhook/merchantWebhookLogs.query"
);

const {
    generateWebhookSignature
} = require(
    "../../../utils/merchant/webhook/webhookSignature.util"
);



const retryWebhookService = async (
    webhookLogId
) => {


    const connection =
        await pool.getConnection();


    try {


        await connection.beginTransaction();



        const [
            rows
        ] = await connection.query(

            LOG_QUERIES.GET_WEBHOOK_LOG_FOR_RETRY,

            [
                webhookLogId
            ]

        );



        if (!rows.length) {

            throw new Error(
                "Webhook log not found."
            );

        }



        const webhookLog = rows[0];



        if (
            webhookLog.retry_status === "COMPLETED"
        ) {

            await connection.rollback();

            return {
                ignored: true,
                message: "Webhook already delivered."
            };

        }



        await connection.query(

            `
UPDATE merchant_webhook_logs

SET

retry_status = 'PROCESSING'

WHERE log_id = ?

`,

            [
                webhookLogId
            ]

        );



        const payload =
            typeof webhookLog.payload === "string"
                ? JSON.parse(webhookLog.payload)
                : webhookLog.payload;



        const signature =
            generateWebhookSignature(

                payload,

                webhookLog.webhook_secret

            );



        let response;



        try {


            response =
                await axios.post(

                    webhookLog.webhook_url,

                    payload,

                    {

                        headers: {

                            "Content-Type":
                                "application/json",

                            "X-Webhook-Signature":
                                signature

                        },

                        timeout: 10000

                    }

                );



        }

        catch (error) {



            const retryCount =
                webhookLog.retry_count + 1;



            await connection.query(

                `
UPDATE merchant_webhook_logs

SET

response_code = ?,

delivery_status = 'FAILED',

retry_count = ?,

retry_status = ?

WHERE log_id = ?

`,

                [

                    error.response?.status || null,

                    retryCount,

                    retryCount >= webhookLog.max_retry
                        ? "FAILED"
                        : "PENDING",

                    webhookLogId

                ]

            );



            await connection.commit();


            throw error;

        }





        await connection.query(

            `
UPDATE merchant_webhook_logs

SET

response_code = ?,

delivery_status = 'SUCCESS',

retry_status = 'COMPLETED',

next_retry_at = NULL

WHERE log_id = ?

`,

            [

                response.status,

                webhookLogId

            ]

        );



        await connection.commit();



        return {

            success: true,

            responseCode:
                response.status

        };



    }

    catch (error) {


        await connection.rollback();

        throw error;


    }

    finally {


        connection.release();


    }

};



module.exports = retryWebhookService;