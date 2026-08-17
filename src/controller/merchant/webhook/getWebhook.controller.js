const db = require("../../../config/pool");

const getWebhookService = require("../../../services/merchant/webhook/getWebhook.service");

const getWebhook = async (req, res) => {
    const connection = await db.getConnection();

    try {

        const result = await getWebhookService(
            connection,
            req.user.merchant_id
        );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(
            "Get Webhook Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch webhooks."
        });

    } finally {

        connection.release();

    }
};

module.exports = getWebhook;