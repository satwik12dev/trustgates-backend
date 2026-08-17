const walletBalanceService = require(
    "../../../services/merchant/wallet/walletBalance.service"
);



// ==========================================================
// Wallet Balance Controller
// ==========================================================

const walletBalance = async (

    req,

    res,

    next

) => {

    try {


        const merchantId =

            req.user.merchant_id;



        const result = await walletBalanceService(

            merchantId

        );


        return res.status(200).json(

            result

        );


    }

    catch(error){

        console.error(

            "Wallet Balance Controller Error:",

            error

        );


        next(error);

    }

};



module.exports = {

    walletBalance

};