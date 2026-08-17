// ==========================================================
// Dashboard Analytics Response Helper
// ==========================================================


const buildDashboardAnalyticsResponse = (

    revenueTrend,

    paymentMethods,

    statusDistribution,

    successRate,

    averageAmount

) => {


    const totalTransactions =

        Number(
            successRate?.total_transactions || 0
        );


    const successfulTransactions =

        Number(
            successRate?.successful_transactions || 0
        );


    const paymentSuccessRate = totalTransactions

        ? (

            (successfulTransactions / totalTransactions) * 100

        ).toFixed(2)

        : "0.00";



    return {


        success:true,


        data:{


            revenueTrend:


                revenueTrend || [],



            paymentMethodDistribution:


                paymentMethods || [],



            transactionStatusDistribution:


                statusDistribution || [],



            successRate:


                paymentSuccessRate,



            averageTransactionAmount:


                Number(
                    averageAmount?.average_amount || 0
                )



        }


    };


};



module.exports = {

    buildDashboardAnalyticsResponse

};