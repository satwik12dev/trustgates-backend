const WALLET_QUERIES = require(
    "../../../queries/wallet/wallet.query"
);


// ==========================================================
// Validate DB Connection
// ==========================================================

const validateConnection = (
    connection
) => {

    if (
        !connection ||
        typeof connection.query !== "function"
    ) {

        throw new Error(
            "Valid MySQL connection is required."
        );

    }

};


// ==========================================================
// Lock Wallet By ID
// ==========================================================

const lockWallet = async (
    connection,
    walletId
) => {

    validateConnection(
        connection
    );


    if (
        walletId === undefined ||
        walletId === null
    ) {

        throw new Error(
            "Wallet ID is required."
        );

    }


    const [
        rows
    ] = await connection.query(

        WALLET_QUERIES.LOCK_WALLET,

        [
            walletId
        ]

    );


    return rows.length
        ? rows[0]
        : null;

};


// ==========================================================
// Lock Wallet By Merchant
// ==========================================================

const lockWalletByMerchant = async (
    connection,
    merchantId
) => {

    validateConnection(
        connection
    );


    if (
        merchantId === undefined ||
        merchantId === null
    ) {

        throw new Error(
            "Merchant ID is required."
        );

    }


    const [
        rows
    ] = await connection.query(

        WALLET_QUERIES.LOCK_WALLET_BY_MERCHANT,

        [
            merchantId
        ]

    );


    return rows.length
        ? rows[0]
        : null;

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    lockWallet,

    lockWalletByMerchant

};