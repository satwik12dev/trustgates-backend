const {

    getTransactionById,

    lockTransaction,

    updateTransactionStatus,

    getTotalRefundedAmount

} = require("../processor/transaction.helper");

// ==========================================================
// Get Transaction
// ==========================================================

const getTransaction = (

    connection,

    transactionId

) => {

    return getTransactionById(

        connection,

        transactionId

    );

};

// ==========================================================
// Lock Transaction
// ==========================================================

const lockTransactionRecord = (

    connection,

    transactionId

) => {

    return lockTransaction(

        connection,

        transactionId

    );

};

// ==========================================================
// Get Total Refunded Amount
// ==========================================================

const getRefundedAmount = (

    connection,

    transactionId

) => {

    return getTotalRefundedAmount(

        connection,

        transactionId

    );

};

// ==========================================================
// Update Transaction Status
// ==========================================================

const updateStatus = (

    connection,

    transactionId,

    status

) => {

    return updateTransactionStatus(

        connection,

        transactionId,

        status

    );

};

// ==========================================================
// Export
// ==========================================================

module.exports = {

    getTransaction,

    lockTransactionRecord,

    getRefundedAmount,

    updateStatus

};