const REFUND_REQUEST_QUERIES = require("../../../../queries/refund/refundRequest.query");

const {

    NotFoundError,

    ConflictError

} = require("../../../../utils/errors");

// ==========================================================
// Get Transaction
// ==========================================================

const getTransaction = async (

    connection,

    merchantId,

    transactionRef

) => {
    console.log(
        "Searching Transaction:",
        {
            merchantId,
            transactionRef
        }
    );
    const [transactions] = await connection.query(

        REFUND_REQUEST_QUERIES.GET_TRANSACTION,

        [

            merchantId,

            transactionRef

        ]

    );

    if (

        !transactions.length

    ) {

        throw new NotFoundError(

            "Transaction not found."

        );

    }

    return transactions[0];

};

// ==========================================================
// Lock Transaction
// ==========================================================

const lockTransaction = async (

    connection,

    transactionId

) => {

    const [transactions] = await connection.query(

        REFUND_REQUEST_QUERIES.LOCK_TRANSACTION,

        [

            transactionId

        ]

    );

    if (

        !transactions.length

    ) {

        throw new NotFoundError(

            "Transaction not found."

        );

    }

    return transactions[0];

};

// ==========================================================
// Validate Transaction
// ==========================================================

const validateTransaction = (

    transaction

) => {

    if (

        transaction.status !== "SUCCESS" &&

        transaction.status !== "PARTIALLY_REFUNDED"

    ) {

        throw new ConflictError(

            "Transaction is not eligible for refund."

        );

    }

};

// ==========================================================
// Get Total Refunded Amount
// ==========================================================

const getRefundedAmount = async (

    connection,

    transactionId

) => {

    const [rows] = await connection.query(

        REFUND_REQUEST_QUERIES.GET_TOTAL_REFUNDED_AMOUNT,

        [

            transactionId

        ]

    );

    return Number(

        rows[0]?.refunded_amount || 0

    );

};

const getTotalRefundRequested = async (
    connection,
    transactionId
) => {

    const [rows] = await connection.query(
        `
        SELECT 
            COALESCE(SUM(requested_amount),0) AS total
        FROM refund_requests
        WHERE transaction_id = ?
        AND status IN (
            'REQUESTED',
            'APPROVED',
            'PROCESSING',
            'COMPLETED'
        )
        `,
        [
            transactionId
        ]
    );

    return Number(rows[0].total);

};

// ==========================================================
// Export
// ==========================================================

module.exports = {

    getTransaction,

    lockTransaction,

    validateTransaction,

    getRefundedAmount,
    getTotalRefundRequested

};