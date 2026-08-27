const {
    TRANSACTION_STATUS,
    TRANSACTION_PAYMENT_METHOD,
    TRANSACTION_PAYMENT_TYPE,
    TRANSACTION_COMPLETION_SOURCE,
    TRANSACTION_SETTLEMENT_STATUS,
    TRANSACTION_GATEWAY
} = require(
    "../../constants/transactions.constants"
);


const isValidEnumValue = (
    value,
    enumObject
) => {

    return Object.values(
        enumObject
    ).includes(value);

};


const validateTransactionId = (
    transactionId
) => {

    const id =
        Number(transactionId);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            "Invalid transaction ID."
        );

    }

    return id;

};


const validateMerchantId = (
    merchantId
) => {

    const id =
        Number(merchantId);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            "Invalid merchant ID."
        );

    }

    return id;

};


const validateTransactionRef = (
    transactionRef
) => {

    if (
        typeof transactionRef !== "string" ||
        transactionRef.length === 0 ||
        transactionRef.length > 50
    ) {

        throw new Error(
            "Invalid transaction reference."
        );

    }

    return transactionRef;

};


const validateOrderId = (
    orderId
) => {

    if (
        typeof orderId !== "string" ||
        orderId.length === 0 ||
        orderId.length > 100
    ) {

        throw new Error(
            "Invalid order ID."
        );

    }

    return orderId;

};


const validateGatewayOrderId = (
    gatewayOrderId
) => {

    if (
        typeof gatewayOrderId !== "string" ||
        gatewayOrderId.length === 0 ||
        gatewayOrderId.length > 100
    ) {

        throw new Error(
            "Invalid gateway order ID."
        );

    }

    return gatewayOrderId;

};


const validateGatewayPaymentId = (
    gatewayPaymentId
) => {

    if (
        typeof gatewayPaymentId !== "string" ||
        gatewayPaymentId.length === 0 ||
        gatewayPaymentId.length > 100
    ) {

        throw new Error(
            "Invalid gateway payment ID."
        );

    }

    return gatewayPaymentId;

};


const validateGatewayReference = (
    gatewayReference
) => {

    if (
        typeof gatewayReference !== "string" ||
        gatewayReference.length === 0 ||
        gatewayReference.length > 100
    ) {

        throw new Error(
            "Invalid gateway reference."
        );

    }

    return gatewayReference;

};


const validateAmount = (
    amount
) => {

    const normalizedAmount =
        Number(amount);

    if (
        !Number.isFinite(
            normalizedAmount
        ) ||
        normalizedAmount <= 0
    ) {

        throw new Error(
            "Invalid transaction amount."
        );

    }

    return normalizedAmount;

};


const validateCurrency = (
    currency
) => {

    if (
        typeof currency !== "string" ||
        !/^[A-Z]{3}$/.test(currency)
    ) {

        throw new Error(
            "Invalid transaction currency."
        );

    }

    return currency;

};


const validatePaymentMethod = (
    paymentMethod
) => {

    if (
        !isValidEnumValue(
            paymentMethod,
            TRANSACTION_PAYMENT_METHOD
        )
    ) {

        throw new Error(
            "Invalid payment method."
        );

    }

    return paymentMethod;

};


const validatePaymentType = (
    paymentType
) => {

    if (
        !isValidEnumValue(
            paymentType,
            TRANSACTION_PAYMENT_TYPE
        )
    ) {

        throw new Error(
            "Invalid payment type."
        );

    }

    return paymentType;

};


const validateTransactionStatus = (
    status
) => {

    if (
        !isValidEnumValue(
            status,
            TRANSACTION_STATUS
        )
    ) {

        throw new Error(
            "Invalid transaction status."
        );

    }

    return status;

};


const validateCompletionSource = (
    source
) => {

    if (
        !isValidEnumValue(
            source,
            TRANSACTION_COMPLETION_SOURCE
        )
    ) {

        throw new Error(
            "Invalid transaction completion source."
        );

    }

    return source;

};


const validateSettlementStatus = (
    status
) => {

    if (
        !isValidEnumValue(
            status,
            TRANSACTION_SETTLEMENT_STATUS
        )
    ) {

        throw new Error(
            "Invalid settlement status."
        );

    }

    return status;

};


const validateGatewayName = (
    gatewayName
) => {

    if (
        !isValidEnumValue(
            gatewayName,
            TRANSACTION_GATEWAY
        )
    ) {

        throw new Error(
            "Invalid gateway name."
        );

    }

    return gatewayName;

};


const validateIdempotencyKey = (
    idempotencyKey
) => {

    if (
        typeof idempotencyKey !== "string" ||
        idempotencyKey.length === 0 ||
        idempotencyKey.length > 100
    ) {

        throw new Error(
            "Invalid idempotency key."
        );

    }

    return idempotencyKey;

};


const validateTransactionAmountFields = ({
    amount,
    merchantFee = 0,
    gatewayFee = 0,
    gatewayTax = 0
}) => {

    const normalizedAmount =
        validateAmount(amount);

    const normalizedMerchantFee =
        Number(merchantFee);

    const normalizedGatewayFee =
        Number(gatewayFee);

    const normalizedGatewayTax =
        Number(gatewayTax);


    if (
        !Number.isFinite(
            normalizedMerchantFee
        ) ||
        normalizedMerchantFee < 0
    ) {

        throw new Error(
            "Invalid merchant fee."
        );

    }


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


    if (
        normalizedMerchantFee +
        normalizedGatewayFee +
        normalizedGatewayTax >
        normalizedAmount
    ) {

        throw new Error(
            "Transaction fees cannot exceed transaction amount."
        );

    }


    return {

        amount:
            normalizedAmount,

        merchantFee:
            normalizedMerchantFee,

        gatewayFee:
            normalizedGatewayFee,

        gatewayTax:
            normalizedGatewayTax

    };

};


const validateTransactionCreateData = ({
    merchantId,
    transactionRef,
    orderId,
    amount,
    currency,
    paymentMethod,
    paymentType,
    gatewayName,
    idempotencyKey
}) => {

    validateMerchantId(
        merchantId
    );

    validateTransactionRef(
        transactionRef
    );

    validateOrderId(
        orderId
    );

    validateAmount(
        amount
    );

    validateCurrency(
        currency
    );

    validatePaymentMethod(
        paymentMethod
    );

    validatePaymentType(
        paymentType
    );

    validateGatewayName(
        gatewayName
    );

    if (idempotencyKey !== null &&
        idempotencyKey !== undefined
    ) {

        validateIdempotencyKey(
            idempotencyKey
        );

    }

    return true;

};


const validatePaymentWebhookData = ({
    merchantId,
    gatewayOrderId,
    gatewayPaymentId,
    amount,
    currency,
    gatewayName
}) => {

    validateMerchantId(
        merchantId
    );

    validateGatewayOrderId(
        gatewayOrderId
    );

    validateGatewayPaymentId(
        gatewayPaymentId
    );

    validateAmount(
        amount
    );

    validateCurrency(
        currency
    );

    validateGatewayName(
        gatewayName
    );

    return true;

};


module.exports = {

    isValidEnumValue,

    validateTransactionId,

    validateMerchantId,

    validateTransactionRef,

    validateOrderId,

    validateGatewayOrderId,

    validateGatewayPaymentId,

    validateGatewayReference,

    validateAmount,

    validateCurrency,

    validatePaymentMethod,

    validatePaymentType,

    validateTransactionStatus,

    validateCompletionSource,

    validateSettlementStatus,

    validateGatewayName,

    validateIdempotencyKey,

    validateTransactionAmountFields,

    validateTransactionCreateData,

    validatePaymentWebhookData

};