const summaryService = require(
    "../../../services/merchant/dashboard/summary.service"
);



// ==========================================================
// Dashboard Summary Controller
// ==========================================================

const dashboardSummary = async (

    req,

    res,

    next

) => {


    try {


        const merchantId =

            req.user.merchant_id;



        const result = await summaryService(

            merchantId

        );



        return res.status(200).json(

            result

        );


    }

    catch(error){


        console.error(
            "Dashboard Summary Error:",
            error
        );


        next(error);


    }


};



module.exports = {

    dashboardSummary

};