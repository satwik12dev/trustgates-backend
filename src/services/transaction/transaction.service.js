const TRANSACTION_QUERIES = require(
    "../../queries/transaction/transaction.query"
);

const {
    TRANSACTION_STATUS,
    TRANSACTION_COMPLETION_SOURCE
} = require(
    "../../constants/transactions.constants"
);

const {
    validateTransactionId,
    validateGatewayOrderId,
    validateGatewayPaymentId,
    validateAmount,
    validateCurrency,
    validateGatewayName
} = require(
    "../../validations/transaction/transaction.validation"
);


// ==================================================
// Find Transaction By Gateway Order ID
// ==================================================

const findTransactionByGatewayOrderId = async (
    connection,
    gatewayOrderId
) => {

    validateGatewayOrderId(
        gatewayOrderId
    );


    const [
        rows
    ] = await connection.query(

        TRANSACTION_QUERIES
            .FIND_TRANSACTION_BY_GATEWAY_ORDER_ID,

        [
            gatewayOrderId
        ]

    );


    return rows.length
        ? rows[0]
        : null;

};


// ==================================================
// Lock Transaction By Gateway Order ID
// ==================================================

const lockTransactionByGatewayOrderId = async (
    connection,
    gatewayOrderId
) => {

    validateGatewayOrderId(
        gatewayOrderId
    );


    const [
        rows
    ] = await connection.query(

        TRANSACTION_QUERIES
            .LOCK_TRANSACTION_BY_GATEWAY_ORDER_ID,

        [
            gatewayOrderId
        ]

    );


    return rows.length
        ? rows[0]
        : null;

};


// ==================================================
// Find Transaction By Payment ID
// ==================================================

const findTransactionByGatewayPaymentId = async (
    connection,
    gatewayPaymentId
) => {

    validateGatewayPaymentId(
        gatewayPaymentId
    );


    const [
        rows
    ] = await connection.query(

        TRANSACTION_QUERIES
            .FIND_TRANSACTION_BY_GATEWAY_PAYMENT_ID,

        [
            gatewayPaymentId
        ]

    );


    return rows.length
        ? rows[0]
        : null;

};


// ==================================================
// Lock Transaction By ID
// ==================================================

const lockTransactionById = async (
    connection,
    transactionId
) => {

    validateTransactionId(
        transactionId
    );


    const [
        rows
    ] = await connection.query(

        TRANSACTION_QUERIES
            .LOCK_TRANSACTION_BY_ID,

        [
            transactionId
        ]

    );


    return rows.length
        ? rows[0]
        : null;

};


// ==================================================
// Mark Transaction Authorized
// ==================================================

const markTransactionAuthorized = async (
    connection,
    {
        transactionId,
        gatewayPaymentId,
        gatewayReference,
        gatewayResponse
    }
) => {

    validateTransactionId(
        transactionId
    );

    validateGatewayPaymentId(
        gatewayPaymentId
    );


    const [
        result
    ] = await connection.query(

        TRANSACTION_QUERIES
            .UPDATE_TRANSACTION_AUTHORIZED,

        [

            gatewayPaymentId,

            gatewayReference || null,

            JSON.stringify(
                gatewayResponse || {}
            ),

            transactionId

        ]

    );


    if (
        result.affectedRows !== 1
    ) {

        throw new Error(
            "Failed to authorize transaction."
        );

    }


    return true;

};


// ==================================================
// Mark Transaction Success
// ==================================================

const markTransactionSuccess = async (
    connection,
    {
        transactionId,
        gatewayPaymentId,
        gatewayReference,
        gatewayResponse,
        gatewayFee = 0,
        gatewayTax = 0
    }
) => {

    validateTransactionId(
        transactionId
    );

    validateGatewayPaymentId(
        gatewayPaymentId
    );


    const normalizedGatewayFee =
        Number(gatewayFee);

    const normalizedGatewayTax =
        Number(gatewayTax);


    if (
        !Number.isFinite(
            normalizedGatewayFee
        ) ||
        normalizedGatewayFee < 0
    ) {

        throw new Error(
            "Invalid gateway fee."
        );

    }


    if (
        !Number.isFinite(
            normalizedGatewayTax
        ) ||
        normalizedGatewayTax < 0
    ) {

        throw new Error(
            "Invalid gateway tax."
        );

    }


    const [
        result
    ] = await connection.query(

        TRANSACTION_QUERIES
            .UPDATE_TRANSACTION_SUCCESS,

        [

            gatewayPaymentId,

            gatewayReference || null,

            JSON.stringify(
                gatewayResponse || {}
            ),

            normalizedGatewayFee,

            normalizedGatewayTax,

            transactionId

        ]

    );


    if (
        result.affectedRows !== 1
    ) {

        throw new Error(
            "Failed to mark transaction as successful."
        );

    }


    return true;

};


// ==================================================
// Mark Transaction Failed
// ==================================================

const markTransactionFailed = async (
    connection,
    {
        transactionId,
        gatewayPaymentId,
        gatewayResponse,
        failureCode,
        failureMessage
    }
) => {

    validateTransactionId(
        transactionId
    );


    if (
        gatewayPaymentId
    ) {

        validateGatewayPaymentId(
            gatewayPaymentId
        );

    }


    const [
        result
    ] = await connection.query(

        TRANSACTION_QUERIES
            .UPDATE_TRANSACTION_FAILED,

        [

            gatewayPaymentId || null,

            JSON.stringify(
                gatewayResponse || {}
            ),

            failureCode || null,

            failureMessage || null,

            transactionId

        ]

    );


    if (
        result.affectedRows !== 1
    ) {

        throw new Error(
            "Failed to mark transaction as failed."
        );

    }


    return true;

};


// ==================================================
// Update Gateway Response
// ==================================================

const updateGatewayResponse = async (
    connection,
    {
        transactionId,
        gatewayResponse
    }
) => {

    validateTransactionId(
        transactionId
    );


    const [
        result
    ] = await connection.query(

        TRANSACTION_QUERIES
            .UPDATE_GATEWAY_RESPONSE,

        [

            JSON.stringify(
                gatewayResponse || {}
            ),

            transactionId

        ]

    );


    if (
        result.affectedRows !== 1
    ) {

        throw new Error(
            "Failed to update gateway response."
        );

    }


    return true;

};


// ==================================================
// Process Successful Payment
// ==================================================

const processSuccessfulPayment = async (
    connection,
    {
        transaction,
        gatewayPaymentId,
        gatewayReference,
        gatewayResponse,
        gatewayFee = 0,
        gatewayTax = 0
    }
) => {

    if (
        !transaction
    ) {

        throw new Error(
            "Transaction not found."
        );

    }


    validateGatewayPaymentId(
        gatewayPaymentId
    );


    validateAmount(
        transaction.amount
    );

    validateCurrency(
        transaction.currency
    );

    validateGatewayName(
        transaction.gateway_name
    );


    // ----------------------------------------------
    // Already Successful
    // ----------------------------------------------

    if (
        transaction.status ===
        TRANSACTION_STATUS.SUCCESS
    ) {

        return {

            success: true,

            duplicate: true,

            transactionId:
                transaction.transaction_id,

            status:
                transaction.status

        };

    }


    // ----------------------------------------------
    // Refunded / Chargeback
    // ----------------------------------------------

    if (
        transaction.status ===
        TRANSACTION_STATUS.REFUNDED ||

        transaction.status ===
        TRANSACTION_STATUS.PARTIALLY_REFUNDED ||

        transaction.status ===
        TRANSACTION_STATUS.CHARGEBACK
    ) {

        throw new Error(
            "Transaction cannot be marked successful from its current state."
        );

    }


    // ----------------------------------------------
    // Failed Transaction
    // ----------------------------------------------

    if (
        transaction.status ===
        TRANSACTION_STATUS.FAILED
    ) {

        throw new Error(
            "Failed transaction cannot be marked successful."
        );

    }


    // ----------------------------------------------
    // Update SUCCESS
    // ----------------------------------------------

    await markTransactionSuccess(

        connection,

        {

            transactionId:
                transaction.transaction_id,

            gatewayPaymentId,

            gatewayReference,

            gatewayResponse,

            gatewayFee,

            gatewayTax

        }

    );


    return {

        success: true,

        duplicate: false,

        transactionId:
            transaction.transaction_id,

        merchantId:
            transaction.merchant_id,

        amount:
            Number(transaction.amount),

        currency:
            transaction.currency,

        status:
            TRANSACTION_STATUS.SUCCESS,

        completionSource:
            TRANSACTION_COMPLETION_SOURCE.WEBHOOK

    };

};


// ==================================================
// Process Failed Payment
// ==================================================

const processFailedPayment = async (
    connection,
    {
        transaction,
        gatewayPaymentId,
        gatewayResponse,
        failureCode,
        failureMessage
    }
) => {

    if (
        !transaction
    ) {

        throw new Error(
            "Transaction not found."
        );

    }


    // ----------------------------------------------
    // Already Successful
    // ----------------------------------------------

    if (
        transaction.status ===
        TRANSACTION_STATUS.SUCCESS
    ) {

        return {

            success: true,

            duplicate: true,

            transactionId:
                transaction.transaction_id,

            status:
                transaction.status

        };

    }


    // ----------------------------------------------
    // Already Failed
    // ----------------------------------------------

    if (
        transaction.status ===
        TRANSACTION_STATUS.FAILED
    ) {

        return {

            success: true,

            duplicate: true,

            transactionId:
                transaction.transaction_id,

            status:
                transaction.status

        };

    }


    await markTransactionFailed(

        connection,

        {

            transactionId:
                transaction.transaction_id,

            gatewayPaymentId,

            gatewayResponse,

            failureCode,

            failureMessage

        }

    );


    return {

        success: true,

        duplicate: false,

        transactionId:
            transaction.transaction_id,

        merchantId:
            transaction.merchant_id,

        amount:
            Number(transaction.amount),

        currency:
            transaction.currency,

        status:
            TRANSACTION_STATUS.FAILED,

        completionSource:
            TRANSACTION_COMPLETION_SOURCE.WEBHOOK

    };

};


// ==================================================
// Export
// ==================================================

module.exports = {

    findTransactionByGatewayOrderId,

    lockTransactionByGatewayOrderId,

    findTransactionByGatewayPaymentId,

    lockTransactionById,

    markTransactionAuthorized,

    markTransactionSuccess,

    markTransactionFailed,

    updateGatewayResponse,

    processSuccessfulPayment,

    processFailedPayment

};