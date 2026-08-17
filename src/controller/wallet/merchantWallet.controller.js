const getWalletService = require(
    "../../services/wallet/getWallet.service"
);


const getWalletSummaryService = require(
    "../../services/wallet/getWalletSummary.service"
);



// ==================================================
// Get Merchant Wallet
// ==================================================

const getMerchantWalletController = async (

    req,

    res,

    next

) => {


    try {


        const merchantId =

            req.user.merchant_id;



        const wallet = await getWalletService(

            merchantId

        );



        return res.status(200).json({

            success:true,

            data:wallet

        });


    }

    catch(error){


        next(error);


    }


};



// ==================================================
// Get Wallet Summary
// ==================================================

const getMerchantWalletSummaryController = async (

    req,

    res,

    next

) => {


    try {


        const merchantId =

            req.user.merchant_id;



        const summary = await getWalletSummaryService(

            merchantId

        );



        return res.status(200).json({

            success:true,

            data:summary

        });


    }

    catch(error){


        next(error);


    }


};





module.exports = {


    getMerchantWalletController,

    getMerchantWalletSummaryController


};