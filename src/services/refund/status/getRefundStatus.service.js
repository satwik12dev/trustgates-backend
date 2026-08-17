const pool = require(
    "../../../config/pool"
);



const getRefundStatusService = async (
    transactionRef
) => {

    const [rows] = await pool.query(

        `SELECT rr.status AS refund_request_status,
                tr.refund_status
        FROM refund_requests rr
        
        LEFT JOIN transaction_refunds tr
        ON tr.transaction_id = rr.transaction_id
        
        WHERE rr.transaction_reference = ?
        ORDER BY rr.request_id DESC
        LIMIT 1
        `,
        [
           transactionRef
        ]

    );



    if (!rows.length) {
        return {
            refundStatus: "NONE"
        };

    }



    const refund = rows[0];



    let status = "PROCESSING";



    if (

        refund.refund_status === "PROCESSED"

    ) {

        status = "REFUNDED";

    }


    else if (

        refund.refund_request_status === "FAILED"

    ) {

        status = "FAILED";

    }



    return {


        refundStatus: status


    };


};



module.exports = {

    getRefundStatusService

};