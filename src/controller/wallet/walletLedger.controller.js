const getWalletLedgerService = require(
    "../../services/wallet/getWalletLedger.service"
);


const getMerchantLedger = require(
    "../../services/wallet/helpers/walletLedger.helper"
);


const pool = require(
    "../../config/pool"
);



// ==================================================
// Merchant Wallet Ledger
// ==================================================

const getMerchantWalletLedgerController = async (

    req,

    res,

    next

) => {


    try {


        const merchantId =

            req.user.merchant_id;



        const {

            page = 1,

            limit = 20


        } = req.query;



        const result = await getWalletLedgerService({

            merchantId,

            page,

            limit

        });



        return res.status(200).json({

            success:true,

            data:result

        });


    }

    catch(error){


        next(error);


    }


};




// ==================================================
// Admin Merchant Ledger
// ==================================================

const getAdminWalletLedgerController = async (

    req,

    res,

    next

) => {


    const connection = await pool.getConnection();


    try {



        const {

            merchantId

        } = req.params;



        const {

            page = 1,

            limit = 20


        } = req.query;



        const walletLedger = await getMerchantLedgerService.getMerchantLedger(

            connection,

            merchantId,

            Number(limit),

            (

                Number(page) - 1

            )

            *

            Number(limit)

        );



        return res.status(200).json({

            success:true,

            data:{


                page:Number(page),


                limit:Number(limit),


                transactions:walletLedger


            }

        });



    }

    catch(error){


        next(error);


    }

    finally{


        connection.release();


    }


};





module.exports = {


    getMerchantWalletLedgerController,

    getAdminWalletLedgerController


};