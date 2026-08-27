const db = require("../../../config/pool");

const deleteWebhookService =
    require("../../../services/merchant/webhook/deleteWebhook.service");


const deleteWebhook = async (req, res) => {

    const connection =
        await db.getConnection();

    try {

        await connection.beginTransaction();

        const result =
            await deleteWebhookService(
                connection,
                {
                    merchantId:
                        req.user.merchant_id,

                    webhookId:
                        req.params.id
                }
            );

        await connection.commit();

        return res.status(200).json({

            success: true,

            message:
                "Webhook disabled successfully.",

            data: result

        });

    } catch (error) {

        try {
            await connection.rollback();
        } catch (_) {}

        console.error(
            "Delete Webhook Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to disable webhook."

        });

    } finally {

        connection.release();


    }

};

module.exports = deleteWebhook;


