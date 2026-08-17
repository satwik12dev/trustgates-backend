const WALLET_HISTORY_QUERIES = {


    // ==================================================
    // Wallet Ledger History
    // ==================================================

    GET_WALLET_HISTORY: `

        SELECT

            wallet_transaction_id,

            wallet_id,

            merchant_id,

            transaction_type,

            source,

            amount,

            balance_before,

            balance_after,

            reference_type,

            reference_id,

            idempotency_key,

            status,

            description,

            metadata,

            created_at


        FROM wallet_transactions


        WHERE merchant_id = ?


        ORDER BY created_at DESC


        LIMIT ?

        OFFSET ?

    `,



    // ==================================================
    // Count Wallet Transactions
    // ==================================================

    COUNT_WALLET_HISTORY: `

        SELECT

            COUNT(*) AS total


        FROM wallet_transactions


        WHERE merchant_id = ?

    `



};


module.exports = WALLET_HISTORY_QUERIES;