const walletAnalyticsService = require(
    "../../../services/merchant/wallet/walletAnalytics.service"
);



// ==========================================================
// Wallet Analytics Controller
// ==========================================================

const walletAnalytics = async (

    req,

    res,

    next

) => {

    try {


        const merchantId =

            req.user.merchant_id;



        const result = await walletAnalyticsService(

            merchantId

        );



        return res.status(200).json(

            result

        );


    }

    catch(error){


        console.error(

            "Wallet Analytics Controller Error:",

            error

        );


        next(error);

    }

};



module.exports = {

    walletAnalytics

};