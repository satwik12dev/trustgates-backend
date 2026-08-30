const MERCHANT_WEBHOOK_LOGS_QUERIES = {


    CREATE_WEBHOOK_LOG: `

        INSERT INTO merchant_webhook_logs

        (
            event_id,

            webhook_id,

            merchant_id,

            event_type,

            payload,

            response_code,

            delivery_status,

            retry_count,

            next_retry_at,

            max_retry,

            retry_status

        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    `,



    GET_MERCHANT_WEBHOOK_LOGS: `

        SELECT

            log_id,

            event_id,

            webhook_id,

            merchant_id,

            event_type,

            payload,

            response_code,

            delivery_status,

            retry_count,

            next_retry_at,

            max_retry,

            retry_status,

            created_at


        FROM merchant_webhook_logs


        WHERE merchant_id = ?


        ORDER BY created_at DESC


        LIMIT ?

        OFFSET ?

    `,



    GET_WEBHOOK_LOG_BY_ID: `

        SELECT

            log_id,

            event_id,

            webhook_id,

            merchant_id,

            event_type,

            payload,

            response_code,

            delivery_status,

            retry_count,

            next_retry_at,

            max_retry,

            retry_status,

            created_at


        FROM merchant_webhook_logs


        WHERE log_id = ?

        AND merchant_id = ?


        LIMIT 1

    `,



    UPDATE_WEBHOOK_LOG: `

        UPDATE merchant_webhook_logs


        SET

            response_code = ?,

            delivery_status = ?,

            retry_count = ?,

            retry_status = ?,

            next_retry_at = ?


        WHERE log_id = ?

    `,



    COUNT_WEBHOOK_LOGS: `

        SELECT

            COUNT(*) AS total_records


        FROM merchant_webhook_logs


        WHERE merchant_id = ?

    `,



    GET_FAILED_WEBHOOK_LOGS: `

        SELECT

            log_id,

            event_id,

            webhook_id,

            merchant_id,

            event_type,

            payload,

            retry_count,

            max_retry


        FROM merchant_webhook_logs


        WHERE retry_status = 'PENDING'


        AND retry_count < max_retry


        AND next_retry_at <= NOW()


        ORDER BY created_at ASC


        LIMIT ?

    `,



    GET_WEBHOOK_LOG_FOR_RETRY: `

        SELECT

            mwl.*,

            mw.webhook_url,

            mw.webhook_secret,

            m.email,

            m.merchant_name


        FROM merchant_webhook_logs mwl


        JOIN merchant_webhooks mw

        ON mw.webhook_id = mwl.webhook_id


        LEFT JOIN merchants m

        ON mwl.merchant_id = m.merchant_id


        WHERE mwl.log_id = ?


        FOR UPDATE

    `



};


module.exports = MERCHANT_WEBHOOK_LOGS_QUERIES;