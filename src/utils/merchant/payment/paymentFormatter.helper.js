// ==========================================================
// Payment History Formatter
// ==========================================================


const formatPaymentHistory = (

    transaction

) => {


    return {


        transactionId:

            transaction.transaction_id,


        transactionReference:

            transaction.transaction_ref,


        orderId:

            transaction.order_id,


        customerName:

            transaction.customer_name,


        customerEmail:

            transaction.customer_email,


        customerPhone:

            transaction.customer_phone,


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


        gatewayName:

            transaction.gateway_name,


        gatewayOrderId:

            transaction.gateway_order_id,


        gatewayPaymentId:

            transaction.gateway_payment_id,


        gatewayReference:

            transaction.gateway_reference,


        status:

            transaction.status,


        completionSource:

            transaction.completion_source,


        settlementStatus:

            transaction.settlement_status,


        merchantFee:

            Number(
                transaction.merchant_fee || 0
            ),


        gatewayFee:

            Number(
                transaction.gateway_fee || 0
            ),


        gatewayTax:

            Number(
                transaction.gateway_tax || 0
            ),


        failureCode:

            transaction.failure_code,


        failureMessage:

            transaction.failure_message,


        createdAt:

            transaction.created_at,


        completedAt:

            transaction.completed_at


    };


};



module.exports = {

    formatPaymentHistory

};