const recentTransactionsService = require(
    "../../../services/merchant/dashboard/recentTransactions.service"
);



// ==========================================================
// Recent Transactions Controller
// ==========================================================

const recentTransactions = async (

    req,

    res,

    next

) => {


    try {


        const merchantId =

            req.user.merchant_id;



        const limit =

            Number(
                req.query.limit || 10
            );



        const result = await recentTransactionsService(

            merchantId,

            limit

        );



        return res.status(200).json(

            result

        );


    }

    catch(error){


        console.error(
            "Recent Transactions Error:",
            error
        );


        next(error);


    }


};



module.exports = {

    recentTransactions

};