const walletService = require(
    "../../../services/merchant/dashboard/wallet.service"
);



// ==========================================================
// Dashboard Wallet Controller
// ==========================================================

const walletOverview = async (

    req,

    res,

    next

) => {


    try {


        const merchantId =

            req.user.merchant_id;



        const result = await walletService(

            merchantId

        );



        return res.status(200).json(

            result

        );


    }

    catch(error){


        console.error(
            "Dashboard Wallet Error:",
            error
        );


        next(error);


    }


};



module.exports = {

    walletOverview

};