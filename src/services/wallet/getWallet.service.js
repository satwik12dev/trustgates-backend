const pool = require(
    "../../config/pool"
);


const {

    getWalletByMerchant

} = require(
    "./helpers/wallet.helper"
);


const {

    validateWalletExists,

    validateWalletOwnership

} = require(
    "./helpers/walletValidation.helper"
);


const {

    buildWalletResponse

} = require(
    "../../utils/wallet/walletResponse.builder"
);



// ==================================================
// Get Merchant Wallet
// ==================================================

const getWalletService = async (


    merchantId


) => {


    const connection = await pool.getConnection();


    try {


        // ==========================================
        // Fetch Wallet
        // ==========================================

        const wallet = await getWalletByMerchant(

            connection,

            merchantId

        );



        // ==========================================
        // Validate Wallet
        // ==========================================

        validateWalletExists(

            wallet

        );



        // ==========================================
        // Ownership Check
        // ==========================================

        validateWalletOwnership(

            merchantId,

            wallet

        );



        // ==========================================
        // Build Response
        // ==========================================

        return buildWalletResponse(

            wallet

        );


    }

    finally {


        connection.release();


    }


};



module.exports = getWalletService;