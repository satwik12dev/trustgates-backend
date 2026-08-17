const walletHistoryService = require(
    "../../../services/merchant/wallet/walletHistory.service"
);



// ==========================================================
// Wallet History Controller
// ==========================================================

const walletHistory = async (

    req,

    res,

    next

) => {

    try {


        const merchantId =

            req.user.merchant_id;



        const filters = {

            page:
                req.query.page,


            limit:
                req.query.limit,


            source:
                req.query.source,


            transaction_type:
                req.query.transaction_type,


            start_date:
                req.query.start_date,


            end_date:
                req.query.end_date

        };



        const result = await walletHistoryService(

            merchantId,

            filters

        );



        return res.status(200).json(

            result

        );


    }

    catch(error){


        console.error(

            "Wallet History Controller Error:",

            error

        );


        next(error);

    }

};



module.exports = {

    walletHistory

};