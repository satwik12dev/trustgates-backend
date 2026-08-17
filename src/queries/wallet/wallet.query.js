const WALLET_QUERIES = {

    // ==========================================================
    // Create Wallet
    // ==========================================================

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


    // ==========================================================
    // Get Wallet By Merchant
    // ==========================================================

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


    // ==========================================================
    // Get Wallet By ID
    // ==========================================================

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


    // ==========================================================
    // Lock Wallet By ID
    // ==========================================================
    //
    // MUST be executed inside a DB transaction.
    //
    // ==========================================================

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


    // ==========================================================
    // Lock Wallet By Merchant
    // ==========================================================

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


    // ==========================================================
    // CREDIT WALLET
    // ==========================================================
    //
    // PAYMENT SUCCESS
    //
    // available_balance += amount
    // total_received    += amount
    //
    // ==========================================================

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

        WHERE merchant_id = ?

          AND wallet_status = 'ACTIVE'

    `,


    // ==========================================================
    // RESERVE WALLET BALANCE
    // ==========================================================
    //
    // REFUND APPROVED
    //
    // total debit requirement:
    //
    // refund amount + fee
    //
    // available → reserved
    //
    // Example:
    //
    // Refund = 1000
    // Fee    = 20
    // Total  = 1020
    //
    // available = 10000
    // reserved  = 0
    //
    // Result:
    //
    // available = 8980
    // reserved  = 1020
    //
    // ==========================================================

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

        WHERE merchant_id = ?

          AND wallet_status = 'ACTIVE'

          AND available_balance >= ?

    `,


    // ==========================================================
    // RELEASE RESERVED BALANCE
    // ==========================================================
    //
    // REFUND FAILED
    //
    // total reserved amount:
    //
    // refund amount + fee
    //
    // reserved → available
    //
    // ==========================================================

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

        WHERE merchant_id = ?

          AND wallet_status = 'ACTIVE'

          AND reserved_balance >= ?

    `,


    // ==========================================================
    // COMPLETE REFUND
    // ==========================================================
    //
    // REFUND SUCCESS
    //
    // IMPORTANT:
    //
    // reserved balance contains:
    //
    // refund amount + fee
    //
    // Therefore:
    //
    // reserved_balance -= total_debit_amount
    //
    // total_refunded += refund_amount
    //
    // available_balance is NOT changed.
    //
    // ==========================================================

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

        WHERE merchant_id = ?

          AND wallet_status = 'ACTIVE'

          AND reserved_balance >= ?

    `,


    // ==========================================================
    // UPDATE WALLET BALANCE
    // ==========================================================
    //
    // Generic controlled update.
    //
    // Do NOT use this for normal refund/payment operations.
    //
    // ==========================================================

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


    // ==========================================================
    // Update Wallet Status
    // ==========================================================

    UPDATE_WALLET_STATUS: `

        UPDATE merchant_wallets

        SET

            wallet_status = ?,

            updated_at = NOW()

        WHERE wallet_id = ?

    `,


    // ==========================================================
    // Get All Wallets
    // ==========================================================

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


    // ==========================================================
    // Check Wallet Exists
    // ==========================================================

    CHECK_WALLET_EXISTS: `

        SELECT

            wallet_id

        FROM merchant_wallets

        WHERE merchant_id = ?

        LIMIT 1

    `

};


module.exports = WALLET_QUERIES;