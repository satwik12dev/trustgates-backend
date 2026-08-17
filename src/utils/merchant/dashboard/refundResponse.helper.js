// ==========================================================
// Refund Dashboard Response Helper
// ==========================================================


const buildRefundDashboardResponse = (

    summary,

    trend,

    statusDistribution

) => {


    return {


        success:true,


        data:{


            summary:{


                totalRefunds:

                    Number(
                        summary.total_refunds || 0
                    ),


                totalRefundAmount:

                    Number(
                        summary.total_refund_amount || 0
                    ),


                completedRefunds:

                    Number(
                        summary.completed_refunds || 0
                    ),


                processingRefunds:

                    Number(
                        summary.processing_refunds || 0
                    ),


                failedRefunds:

                    Number(
                        summary.failed_refunds || 0
                    )


            },


            trend:

                trend || [],


            statusDistribution:

                statusDistribution || []



        }


    };


};



module.exports = {

    buildRefundDashboardResponse

};