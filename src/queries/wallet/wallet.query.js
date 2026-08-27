const WALLET_QUERIES = {

    CREATE_WALLET: `

        INSERT INTO merchant_wallets
        (
            merchant_id,
            currency
        )

        VALUES
        (
            ?,
            ?
        )

    `,


    GET_WALLET_BY_MERCHANT: `

        SELECT

            wallet_id,
            merchant_id,

            available_balance,
            pending_balance,
            reserved_balance,
            blocked_balance,

            total_received,
            total_refunded,
            total_settled,

            currency,
            wallet_status,

            version,
            last_transaction_at,

            created_at,
            updated_at

        FROM merchant_wallets

        WHERE merchant_id = ?

        LIMIT 1

    `,


    GET_WALLET_BY_ID: `

        SELECT

            wallet_id,
            merchant_id,

            available_balance,
            pending_balance,
            reserved_balance,
            blocked_balance,

            total_received,
            total_refunded,
            total_settled,

            currency,
            wallet_status,

            version,
            last_transaction_at,

            created_at,
            updated_at

        FROM merchant_wallets

        WHERE wallet_id = ?

        LIMIT 1

    `,


    LOCK_WALLET: `

        SELECT

            wallet_id,
            merchant_id,

            available_balance,
            pending_balance,
            reserved_balance,
            blocked_balance,

            total_received,
            total_refunded,
            total_settled,

            currency,
            wallet_status,

            version,
            last_transaction_at,

            created_at,
            updated_at

        FROM merchant_wallets

        WHERE wallet_id = ?

        LIMIT 1

        FOR UPDATE

    `,


    LOCK_WALLET_BY_MERCHANT: `

        SELECT

            wallet_id,
            merchant_id,

            available_balance,
            pending_balance,
            reserved_balance,
            blocked_balance,

            total_received,
            total_refunded,
            total_settled,

            currency,
            wallet_status,

            version,
            last_transaction_at,

            created_at,
            updated_at

        FROM merchant_wallets

        WHERE merchant_id = ?

        LIMIT 1

        FOR UPDATE

    `,


    CREDIT_WALLET: `

        UPDATE merchant_wallets

        SET

            available_balance =
                available_balance + ?,

            total_received =
                total_received + ?,

            version =
                version + 1,

            last_transaction_at =
                NOW(),

            updated_at =
                NOW()

        WHERE wallet_id = ?

          AND wallet_status = 'ACTIVE'

    `,


    RESERVE_WALLET_BALANCE: `

        UPDATE merchant_wallets

        SET

            available_balance =
                available_balance - ?,

            reserved_balance =
                reserved_balance + ?,

            version =
                version + 1,

            last_transaction_at =
                NOW(),

            updated_at =
                NOW()

        WHERE wallet_id = ?

          AND wallet_status = 'ACTIVE'

          AND available_balance >= ?

    `,


    RELEASE_RESERVED_BALANCE: `

        UPDATE merchant_wallets

        SET

            available_balance =
                available_balance + ?,

            reserved_balance =
                reserved_balance - ?,

            version =
                version + 1,

            last_transaction_at =
                NOW(),

            updated_at =
                NOW()

        WHERE wallet_id = ?

          AND wallet_status = 'ACTIVE'

          AND reserved_balance >= ?

    `,


    COMPLETE_REFUND: `

        UPDATE merchant_wallets

        SET

            reserved_balance =
                reserved_balance - ?,

            total_refunded =
                total_refunded + ?,

            version =
                version + 1,

            last_transaction_at =
                NOW(),

            updated_at =
                NOW()

        WHERE wallet_id = ?

          AND wallet_status = 'ACTIVE'

          AND reserved_balance >= ?

    `,


    UPDATE_WALLET_BALANCE: `

        UPDATE merchant_wallets

        SET

            available_balance = ?,

            pending_balance = ?,

            reserved_balance = ?,

            blocked_balance = ?,

            total_received = ?,

            total_refunded = ?,

            total_settled = ?,

            last_transaction_at = NOW(),

            version = version + 1,

            updated_at = NOW()

        WHERE wallet_id = ?

    `,


    UPDATE_WALLET_STATUS: `

        UPDATE merchant_wallets

        SET

            wallet_status = ?,

            updated_at = NOW()

        WHERE wallet_id = ?

    `,


    GET_ALL_WALLETS: `

        SELECT

            mw.wallet_id,
            mw.merchant_id,

            m.merchant_name,
            m.email,
            m.merchant_code,

            mw.available_balance,
            mw.pending_balance,
            mw.reserved_balance,
            mw.blocked_balance,

            mw.total_received,
            mw.total_refunded,
            mw.total_settled,

            mw.currency,
            mw.wallet_status,

            mw.version,
            mw.last_transaction_at,

            mw.created_at,
            mw.updated_at

        FROM merchant_wallets mw

        INNER JOIN merchants m
            ON m.merchant_id =
               mw.merchant_id

        ORDER BY
            mw.created_at DESC

    `,


    CHECK_WALLET_EXISTS: `

        SELECT

            wallet_id

        FROM merchant_wallets

        WHERE merchant_id = ?

        LIMIT 1

    `

};


module.exports = WALLET_QUERIES;