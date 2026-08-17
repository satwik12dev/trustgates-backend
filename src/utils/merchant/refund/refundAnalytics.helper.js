// ==========================================================
// Refund Analytics Helper
// ==========================================================


const buildRefundAnalyticsResponse = (

    summary,

    trend

) => {


    const totalRefunds =

        Number(
            summary.total_refunds || 0
        );



    const completed =

        Number(
            summary.completed_refunds || 0
        );



    return {


        success:true,


        data:{


            totalRefunds,


            totalRefundAmount:

                Number(
                    summary.total_refund_amount || 0
                ),



            completedRefunds:

                completed,



            processingRefunds:

                Number(
                    summary.processing_refunds || 0
                ),



            failedRefunds:

                Number(
                    summary.failed_refunds || 0
                ),



            fullRefunds:

                Number(
                    summary.full_refunds || 0
                ),



            partialRefunds:

                Number(
                    summary.partial_refunds || 0
                ),



            refundSuccessRate:

                totalRefunds === 0

                ? 0

                :

                Number(
                    (
                        completed /
                        totalRefunds
                    )
                    *
                    100
                )
                .toFixed(2),



            trend

        }

    };


};



module.exports = {

    buildRefundAnalyticsResponse

};