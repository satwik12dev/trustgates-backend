const ADMIN_WALLET_QUERIES = {

    GET_ACTIVE_FOR_UPDATE: `
        SELECT
            admin_wallet_id,
            balance,
            currency,
            status,
            created_at,
            updated_at
        FROM admin_wallets
        WHERE status = 'ACTIVE'
        ORDER BY admin_wallet_id ASC
        LIMIT 1
        FOR UPDATE
    `

};


// ==========================================================
// Lock Active Admin Wallet
// ==========================================================

const lockAdminWallet = async (
    connection
) => {

    const [
        rows
    ] = await connection.query(

        ADMIN_WALLET_QUERIES
            .GET_ACTIVE_FOR_UPDATE

    );


    if (
        !rows.length
    ) {

        return null;

    }


    return rows[0];

};


module.exports = {

    lockAdminWallet

};