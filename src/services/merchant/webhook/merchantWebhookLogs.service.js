const LOG_QUERIES = require(
    "../../../queries/merchant/webhook/merchantWebhookLogs.query"
);


const merchantWebhookLogsService = async (
    connection,
    {
        merchantId,
        limit = 20,
        offset = 0
    }
) => {

    const [logs] = await connection.query(
        LOG_QUERIES.GET_MERCHANT_WEBHOOK_LOGS,
        [
            merchantId,
            Number(limit),
            Number(offset)
        ]
    );

    const [count] = await connection.query(
        LOG_QUERIES.COUNT_WEBHOOK_LOGS,
        [
            merchantId
        ]
    );

    return {
        logs: logs.map(log => ({
            logId: log.log_id,
            webhookId: log.webhook_id,
            eventType: log.event_type,
            payload: typeof log.payload === "string"
                ? JSON.parse(log.payload)
                : log.payload,
            responseCode: log.response_code,
            deliveryStatus: log.delivery_status,
            retryCount: log.retry_count,
            createdAt: log.created_at
        })),
        pagination: {
            total: count[0].total_records,
            limit: Number(limit),
            offset: Number(offset)
        }
    };
};

module.exports = merchantWebhookLogsService;