// ==========================================================
// Recent Transactions Response Helper
// ==========================================================


const buildRecentTransactionsResponse = (

    transactions

) => {


    return {


        success:true,


        data:{


            transactions:

                transactions.map((transaction)=>{


                    return {


                        transactionId:

                            transaction.transaction_id,


                        transactionReference:

                            transaction.transaction_ref,


                        orderId:

                            transaction.order_id,


                        customerName:

                            transaction.customer_name,


                        amount:

                            Number(
                                transaction.amount
                            ),


                        currency:

                            transaction.currency,


                        paymentMethod:

                            transaction.payment_method,


                        paymentType:

                            transaction.payment_type,


                        status:

                            transaction.status,


                        completionSource:

                            transaction.completion_source,


                        createdAt:

                            transaction.created_at



                    };


                })


        }


    };


};



module.exports = {

    buildRecentTransactionsResponse

};