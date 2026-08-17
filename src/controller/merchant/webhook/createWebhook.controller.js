const db = require("../../../config/pool");

const createWebhookService = require("../../../services/merchant/webhook/createWebhook.service");


const createWebhook = async (req, res) => {

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const {
            webhookUrl,
            events
        } = req.body;


        const result = await createWebhookService(
            connection, 
            {
                merchantId: req.user.merchant_id,
                webhookUrl,
                events
            }
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Webhook created successfully.",
            data: result
        });

    } catch(error) {
        await connection.rollback();
        console.error(
            "Create Webhook Error:",
            error
        );
        return res.status(500).json({
            success:false,
            message:
                error.message ||
                "Failed to create webhook."
        });
    } finally {
        connection.release();
    }
};

module.exports = createWebhook;