const WALLET_QUERIES = require("../../../queries/wallet/wallet.query");


// ==================================================
// Lock Wallet By ID
// ==================================================

const lockWallet = async (

    connection,

    walletId

) => {


    const [rows] = await connection.query(

        WALLET_QUERIES.LOCK_WALLET,

        [

            walletId

        ]

    );


    return rows[0] || null;


};



// ==================================================
// Lock Wallet By Merchant
// ==================================================

const lockWalletByMerchant = async (

    connection,

    merchantId

) => {


    const [rows] = await connection.query(

        WALLET_QUERIES.LOCK_WALLET_BY_MERCHANT,

        [

            merchantId

        ]

    );


    return rows[0] || null;


};



module.exports = {


    lockWallet,

    lockWalletByMerchant

};