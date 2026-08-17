const pool = require(
    "../../../config/pool"
);


const PAYMENT_STATUS_QUERIES = require(
    "../../../queries/merchant/payment/paymentStatus.query"
);



const {
    buildPaymentStatusResponse
} = require(
    "../../../utils/merchant/payment/paymentResponse.helper"
);



// ==========================================================
// Payment Status Service
// ==========================================================

const paymentStatusService = async (

    merchantId,

    transactionRef

) => {


    const connection = await pool.getConnection();


    try {


        const [
            rows
        ] = await connection.query(

            PAYMENT_STATUS_QUERIES.GET_PAYMENT_STATUS,

            [

                merchantId,

                transactionRef

            ]

        );



        if(!rows.length){


            return {


                success:false,


                message:
                    "Transaction not found."


            };


        }



        return buildPaymentStatusResponse(

            rows[0]

        );


    }


    finally {


        connection.release();


    }


};



module.exports = paymentStatusService;