const analyticsService = require(
    "../../../services/merchant/dashboard/analytics.service"
);



// ==========================================================
// Dashboard Analytics Controller
// ==========================================================

const dashboardAnalytics = async (

    req,

    res,

    next

) => {


    try {


        const merchantId =

            req.user.merchant_id;



        const result = await analyticsService(

            merchantId

        );



        return res.status(200).json(

            result

        );


    }

    catch(error){


        console.error(
            "Dashboard Analytics Error:",
            error
        );


        next(error);


    }


};



module.exports = {

    dashboardAnalytics

};