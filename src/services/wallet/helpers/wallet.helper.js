const WALLET_QUERIES = require(
    "../../../queries/wallet/wallet.query"
);


const getWalletByMerchant = async (
    connection,
    merchantId
) => {

    const [rows] = await connection.query(
        WALLET_QUERIES.GET_WALLET_BY_MERCHANT,
        [merchantId]
    );

    return rows[0] || null;
};


const getWalletById = async (
    connection,
    walletId
) => {

    const [rows] = await connection.query(
        WALLET_QUERIES.GET_WALLET_BY_ID,
        [walletId]
    );

    return rows[0] || null;
};


const checkWalletExists = async (
    connection,
    merchantId
) => {

    const [rows] = await connection.query(
        WALLET_QUERIES.CHECK_WALLET_EXISTS,
        [merchantId]
    );

    return rows.length > 0;
};


module.exports = {
    getWalletByMerchant,
    getWalletById,
    checkWalletExists
};