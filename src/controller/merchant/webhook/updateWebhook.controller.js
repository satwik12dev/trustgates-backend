const db = require("../../../config/pool");

const updateWebhookService = require("../../../services/merchant/webhook/updateWebhook.service");


const updateWebhook = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const result = await updateWebhookService(
            connection,
            {
                merchantId: req.user.merchant_id,
                webhookId: req.params.id,
                webhookUrl: req.body.webhookUrl,
                events: req.body.events,
                status: req.body.status
            }
        );

        await connection.commit();
        return res.status(200).json({
            success: true,
            message:"Webhook updated successfully.",
            data: result
        });

    } catch(error) {
        await connection.rollback();
        console.error(
            "Update Webhook Error:",
            error
        );

        return res.status(500).json({
            success:false,
            message:
                error.message ||
                "Failed to update webhook."
        });
    } finally {
        connection.release();
    }
};

module.exports = updateWebhook;