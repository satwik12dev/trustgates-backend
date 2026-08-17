
const {

    formatPaymentHistory

} = require(
    "./paymentFormatter.helper"
);


// ==========================================================
// Payment Response Helper
// ==========================================================


const buildPaymentStatusResponse = (

    transaction

) => {


    return {


        success:true,


        data:{


            transactionId:

                transaction.transaction_id,


            transactionReference:

                transaction.transaction_ref,


            orderId:

                transaction.order_id,


            amount:

                Number(
                    transaction.amount
                ),


            currency:

                transaction.currency,


            paymentMethod:

                transaction.payment_method,


            status:

                transaction.status,


            completionSource:

                transaction.completion_source,


            gatewayPaymentId:

                transaction.gateway_payment_id,


            createdAt:

                transaction.created_at,


            completedAt:

                transaction.completed_at



        }


    };


};

// ==========================================================
// Payment History Response
// ==========================================================

const buildPaymentHistoryResponse = (

    transactions,

    pagination

) => {


    return {


        success:true,


        data:{


            transactions:

                transactions.map(

                    formatPaymentHistory

                ),



            pagination


        }


    };


};



module.exports = {

    buildPaymentStatusResponse,
    buildPaymentHistoryResponse

};