const db = require("../../../config/pool");

const merchantWebhookLogsService = require("../../../services/merchant/webhook/merchantWebhookLogs.service");

const merchantWebhookLogs = async (req, res) => {

    const connection = await db.getConnection();

    try {
        const {
            limit = 20,
            offset = 0
        } = req.query;

        const result = await merchantWebhookLogsService(
            connection,
            {
                merchantId: req.user.merchantId,
                limit,
                offset
            }
        );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch(error) {
        console.error(
            "Merchant Webhook Logs Error:",
            error
        );

        return res.status(500).json({
            success:false,
            message:
                error.message ||
                "Failed to fetch webhook logs."
        });
    } finally {
        connection.release();
    }
};

module.exports = merchantWebhookLogs;