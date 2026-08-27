const WEBHOOK_QUERIES = {

    GET_WEBHOOK_BY_ID: `

        SELECT

            webhook_id,
            merchant_id,
            provider,
            provider_id,
            webhook_url,
            webhook_secret,
            events,
            status,

            failure_count,
            last_triggered_at,
            last_response_code,

            created_at,
            updated_at

        FROM merchant_webhooks

        WHERE webhook_id = ?

        LIMIT 1

    `,


    GET_ACTIVE_WEBHOOK_BY_ID: `

        SELECT

            webhook_id,
            merchant_id,
            provider,
            provider_id,
            webhook_url,
            webhook_secret,
            events,
            status,

            failure_count,
            last_triggered_at,
            last_response_code,

            created_at,
            updated_at

        FROM merchant_webhooks

        WHERE webhook_id = ?

          AND status = 'ACTIVE'

        LIMIT 1

    `,


    GET_WEBHOOK_WITH_PROVIDER: `

        SELECT

            mw.webhook_id,
            mw.merchant_id,

            mw.provider,
            mw.provider_id,

            mw.webhook_url,
            mw.webhook_secret,
            mw.events,
            mw.status,

            mw.failure_count,
            mw.last_triggered_at,
            mw.last_response_code,

            mpp.provider_name,
            mpp.key_id,
            mpp.key_secret,
            mpp.webhook_secret AS provider_webhook_secret,
            mpp.status AS provider_status

        FROM merchant_webhooks mw

        INNER JOIN merchant_payment_providers mpp

            ON mpp.provider_id = mw.provider_id

        WHERE mw.webhook_id = ?

        LIMIT 1

    `,


    GET_ACTIVE_WEBHOOK_WITH_PROVIDER: `

        SELECT

            mw.webhook_id,
            mw.merchant_id,

            mw.provider,
            mw.provider_id,

            mw.webhook_url,
            mw.webhook_secret,
            mw.events,
            mw.status,

            mw.failure_count,
            mw.last_triggered_at,
            mw.last_response_code,

            mpp.provider_name,
            mpp.key_id,
            mpp.key_secret,
            mpp.webhook_secret AS provider_webhook_secret,
            mpp.status AS provider_status

        FROM merchant_webhooks mw

        INNER JOIN merchant_payment_providers mpp

            ON mpp.provider_id = mw.provider_id

        WHERE mw.webhook_id = ?

          AND mw.status = 'ACTIVE'

          AND mpp.status = 'ACTIVE'

        LIMIT 1

    `

};


module.exports = WEBHOOK_QUERIES;