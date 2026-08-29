// ==========================================================
// Razorpay Transaction Webhook Helper
// ==========================================================

const QUERIES = require(
    "../../../queries/webhook/transactionWebhook.query"
);


// ==========================================================
// Find Existing Transaction By Merchant + Order ID
// ==========================================================

const findTransactionByOrderId = async (
    connection,
    merchantId,
    orderId
) => {

    const [rows] = await connection.query(
        QUERIES.FIND_TRANSACTION_BY_ORDER_ID,
        [
            merchantId,
            orderId
        ]
    );

    return rows[0] || null;
};


// ==========================================================
// Find Transaction By Merchant + Gateway Payment ID
// ==========================================================

const findTransactionByGatewayPaymentId = async (
    connection,
    merchantId,
    gatewayPaymentId
) => {

    if (!gatewayPaymentId) {
        return null;
    }

    const [rows] = await connection.query(
        QUERIES.FIND_TRANSACTION_BY_GATEWAY_PAYMENT_ID,
        [
            merchantId,
            gatewayPaymentId
        ]
    );

    return rows[0] || null;
};


// ==========================================================
// Create Main Transaction
// ==========================================================

const createTransaction = async (
    connection,
    transactionData
) => {

    const [result] = await connection.query(
        QUERIES.CREATE_TRANSACTION,
        [
            transactionData.merchantId,
            transactionData.transactionRef,
            transactionData.orderId,
            transactionData.gatewayOrderId,
            transactionData.gatewayPaymentId,
            transactionData.gatewayReference,
            transactionData.gatewayResponse,
            transactionData.customerName,
            transactionData.customerEmail,
            transactionData.customerPhone,
            transactionData.amount,
            transactionData.currency,
            transactionData.paymentMethod,
            transactionData.gatewayName,
            transactionData.paymentType,
            transactionData.status,
            transactionData.completionSource,
            transactionData.merchantFee,
            transactionData.gatewayFee,
            transactionData.gatewayTax,
            transactionData.settlementStatus,
            transactionData.failureCode,
            transactionData.failureMessage,
            transactionData.attemptCount,
            transactionData.expiresAt,
            transactionData.idempotencyKey,
            transactionData.clientIp,
            transactionData.userAgent,
            transactionData.remarks
        ]
    );

    return result.insertId;
};


// ==========================================================
// Update Main Transaction
// ==========================================================

const updateTransaction = async (
    connection,
    transactionId,
    transactionData
) => {

    const [result] = await connection.query(
        QUERIES.UPDATE_TRANSACTION,
        [
            transactionData.gatewayPaymentId,
            transactionData.gatewayReference,
            transactionData.gatewayResponse,
            transactionData.paymentMethod,
            transactionData.status,
            transactionData.completionSource,
            transactionData.failureCode,
            transactionData.failureMessage,
            transactionData.completedAt,
            transactionData.attemptCount,
            transactionData.settlementStatus,
            transactionId
        ]
    );

    return result;
};


// ==========================================================
// Card Details
// ==========================================================

const createCardTransaction = async (
    connection,
    transactionId,
    cardData
) => {

    const [result] = await connection.query(
        QUERIES.CREATE_TRANSACTION_CARD,
        [
            transactionId,
            cardData.cardNetwork,
            cardData.cardType,
            cardData.lastFour,
            cardData.issuer,
            cardData.bankName,
            cardData.authCode,
            cardData.gatewayReference,
            cardData.country
        ]
    );

    return result.insertId;
};


// ==========================================================
// UPI Details
// ==========================================================

const createUpiTransaction = async (
    connection,
    transactionId,
    upiData
) => {

    const [result] = await connection.query(
        QUERIES.CREATE_TRANSACTION_UPI,
        [
            transactionId,
            upiData.vpa,
            upiData.payerName,
            upiData.payerAccountType,
            upiData.rrn,
            upiData.npciTransactionId,
            upiData.bankReference,
            upiData.gatewayResponseCode,
            upiData.gatewayResponseMessage
        ]
    );

    return result.insertId;
};


// ==========================================================
// Net Banking Details
// ==========================================================

const createNetbankingTransaction = async (
    connection,
    transactionId,
    netbankingData
) => {

    const [result] = await connection.query(
        QUERIES.CREATE_TRANSACTION_NETBANKING,
        [
            transactionId,
            netbankingData.bankCode,
            netbankingData.bankName,
            netbankingData.bankTransactionId,
            netbankingData.gatewayReference
        ]
    );

    return result.insertId;
};


// ==========================================================
// Wallet Details
// ==========================================================

const createWalletTransaction = async (
    connection,
    transactionId,
    walletData
) => {

    const [result] = await connection.query(
        QUERIES.CREATE_TRANSACTION_WALLET,
        [
            transactionId,
            walletData.walletName,
            walletData.walletTransactionId,
            walletData.gatewayReference
        ]
    );

    return result.insertId;
};


// ==========================================================
// EMI Details
// ==========================================================

const createEmiTransaction = async (
    connection,
    transactionId,
    emiData
) => {

    const [result] = await connection.query(
        QUERIES.CREATE_TRANSACTION_EMI,
        [
            transactionId,
            emiData.issuer,
            emiData.tenure,
            emiData.interestRate,
            emiData.gatewayReference
        ]
    );

    return result.insertId;
};


// ==========================================================
// Paylater Details
// ==========================================================

const createPaylaterTransaction = async (
    connection,
    transactionId,
    paylaterData
) => {

    const [result] = await connection.query(
        QUERIES.CREATE_TRANSACTION_PAYLATER,
        [
            transactionId,
            paylaterData.providerName,
            paylaterData.loanReference,
            paylaterData.dueDate,
            paylaterData.gatewayReference
        ]
    );

    return result.insertId;
};


// ==========================================================
// Increment Transaction Attempt Count
// ==========================================================

const incrementAttemptCount = async (
    connection,
    transactionId
) => {

    const [result] = await connection.query(
        QUERIES.INCREMENT_ATTEMPT_COUNT,
        [
            transactionId
        ]
    );

    return result;
};


// ==========================================================
// Update Transaction Status
// ==========================================================

const updateTransactionStatus = async (
    connection,
    transactionId,
    status,
    completionSource,
    failureCode = null,
    failureMessage = null
) => {

    const [result] = await connection.query(
        QUERIES.UPDATE_TRANSACTION_STATUS,
        [
            status,
            completionSource,
            failureCode,
            failureMessage,
            transactionId
        ]
    );

    return result;
};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    findTransactionByOrderId,
    findTransactionByGatewayPaymentId,

    createTransaction,
    updateTransaction,

    createCardTransaction,
    createUpiTransaction,
    createNetbankingTransaction,
    createWalletTransaction,
    createEmiTransaction,
    createPaylaterTransaction,

    incrementAttemptCount,
    updateTransactionStatus

};