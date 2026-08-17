const WALLET_BALANCE_QUERIES = {


    // ==================================================
    // Get Merchant Wallet Balance
    // ==================================================

    GET_WALLET_BALANCE: `

        SELECT

            wallet_id,

            merchant_id,

            available_balance,

            pending_balance,

            blocked_balance,

            total_received,

            total_refunded,

            total_settled,

            currency,

            wallet_status,

            last_transaction_at,

            created_at,

            updated_at


        FROM merchant_wallets


        WHERE merchant_id = ?

        LIMIT 1

    `


};


module.exports = WALLET_BALANCE_QUERIES;