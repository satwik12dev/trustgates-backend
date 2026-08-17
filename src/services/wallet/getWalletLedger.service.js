const pool = require(
    "../../config/pool"
);


const {

    getWalletByMerchant

} = require(
    "./helpers/wallet.helper"
);


const {

    getWalletLedger

} = require(
    "./helpers/walletLedger.helper"
);


const {
    validateWalletExists,
    validateWalletOwnership
} = require("./helpers/walletValidation.helper");


const {

    buildLedgerResponse

} = require(
    "../../utils/wallet/walletResponse.builder"
);



// ==================================================
// Get Wallet Ledger
// ==================================================

const getWalletLedgerService = async ({

    merchantId,

    page = 1,

    limit = 20

}) => {


    const connection = await pool.getConnection();


    try {


        // ==========================================
        // Get Wallet
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



        validateWalletOwnership(

            merchantId,

            wallet

        );



        // ==========================================
        // Pagination
        // ==========================================

        const offset =

            (

                Number(page) - 1

            )

            *

            Number(limit);



        // ==========================================
        // Get Ledger
        // ==========================================

        const ledger = await getWalletLedger(

            connection,

            wallet.wallet_id,

            Number(limit),

            offset

        );



        // ==========================================
        // Build Response
        // ==========================================

        return {


            walletId:

                wallet.wallet_id,


            page:

                Number(page),


            limit:

                Number(limit),



            transactions:

                ledger.map(

                    (transaction) =>

                        buildLedgerResponse(

                            transaction

                        )

                )


        };


    }

    finally {


        connection.release();


    }


};



module.exports = getWalletLedgerService;