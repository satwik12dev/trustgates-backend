const SEARCH_WALLETS = `

    SELECT

        mw.wallet_id,

        mw.merchant_id,

        mw.available_balance,

        mw.pending_balance,

        mw.reserved_balance,

        mw.blocked_balance,

        mw.total_received,

        mw.total_refunded,

        mw.total_settled,

        mw.wallet_status,

        mw.currency,

        mw.created_at,

        mw.updated_at,

        m.merchant_name,

        m.email,

        m.merchant_code

    FROM merchant_wallets mw

    INNER JOIN merchants m

        ON m.merchant_id =
           mw.merchant_id

    WHERE 1=1

`;


module.exports = {

    SEARCH_WALLETS

};