const pool = require(
    "../../config/pool"
);


const {

    getWalletByMerchant

} = require(
    "./helpers/wallet.helper"
);


const {

    validateWalletExists

} = require(
    "./helpers/walletValidation.helper"
);



// ==================================================
// Get Wallet Summary
// ==================================================

const getWalletSummaryService = async (

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
        // Build Summary
        // ==========================================

        return {


            walletId:

                wallet.wallet_id,


            merchantId:

                wallet.merchant_id,



            balance: {


                available:

                    Number(
                        wallet.available_balance
                    ),


                pending:

                    Number(
                        wallet.pending_balance
                    ),


                blocked:

                    Number(
                        wallet.blocked_balance
                    )


            },



            totals: {


                received:

                    Number(
                        wallet.total_received
                    ),


                refunded:

                    Number(
                        wallet.total_refunded
                    ),


                settled:

                    Number(
                        wallet.total_settled
                    )


            },



            currency:

                wallet.currency,



            status:

                wallet.wallet_status,



            lastTransactionAt:

                wallet.last_transaction_at,


            createdAt:

                wallet.created_at,


            updatedAt:

                wallet.updated_at


        };


    }

    finally {


        connection.release();


    }


};



module.exports = getWalletSummaryService;