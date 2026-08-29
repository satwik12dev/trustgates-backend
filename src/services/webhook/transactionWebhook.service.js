// ==========================================================
// Merchant Transaction Webhook Service
// Razorpay Only
// ==========================================================

const db = require("../../config/pool");

const helper = require(
    "./helper/transactionWebhook.helper"
);


// ==========================================================
// Allowed Status Priority
// ==========================================================

const STATUS_PRIORITY = {

    CREATED: 1,

    PENDING: 2,

    AUTHORIZED: 3,

    FAILED: 3,

    CANCELLED: 3,

    SUCCESS: 4,

    REFUNDED: 5,

    PARTIALLY_REFUNDED: 5,

    CHARGEBACK: 6

};


// ==========================================================
// Resolve Razorpay Event → Internal Status
// ==========================================================

const resolveTransactionStatus = (event) => {

    switch (event) {

        case "payment.created":
            return "CREATED";

        case "payment.authorized":
            return "AUTHORIZED";

        case "payment.captured":
            return "SUCCESS";

        case "payment.failed":
            return "FAILED";

        default:
            return null;
    }
};


// ==========================================================
// Should Transaction Status Be Updated?
// ==========================================================

const shouldUpdateStatus = (
    currentStatus,
    incomingStatus
) => {

    if (!incomingStatus) {
        return false;
    }

    if (!currentStatus) {
        return true;
    }

    /*
     * Terminal successful transaction must not move
     * backwards because of a delayed webhook.
     */

    if (
        currentStatus === "SUCCESS" &&
        incomingStatus !== "REFUNDED" &&
        incomingStatus !== "PARTIALLY_REFUNDED" &&
        incomingStatus !== "CHARGEBACK"
    ) {

        return false;
    }


    /*
     * Failed / cancelled transactions should also
     * not be moved backwards by lower priority events.
     */

    if (
        currentStatus === "REFUNDED" ||
        currentStatus === "PARTIALLY_REFUNDED" ||
        currentStatus === "CHARGEBACK"
    ) {

        return false;
    }


    const currentPriority =
        STATUS_PRIORITY[currentStatus] || 0;

    const incomingPriority =
        STATUS_PRIORITY[incomingStatus] || 0;


    return incomingPriority >= currentPriority;
};


// ==========================================================
// Extract Razorpay Payment Entity
// ==========================================================

const getPaymentEntity = (payload) => {

    return (
        payload?.payload?.payment?.entity ||
        payload?.payment?.entity ||
        payload?.payment ||
        null
    );
};


// ==========================================================
// Extract Order ID
// ==========================================================

const getOrderId = (payment) => {

    return (
        payment?.order_id ||
        payment?.orderId ||
        null
    );
};


// ==========================================================
// Resolve Payment Method
// ==========================================================

const resolvePaymentMethod = (payment) => {

    const method =
        String(
            payment?.method || ""
        ).toLowerCase();


    switch (method) {

        case "upi":
            return "UPI";

        case "card":
            return "CARD";

        case "netbanking":
            return "NETBANKING";

        case "wallet":
            return "WALLET";

        case "emi":
            return "EMI";

        case "paylater":
            return "PAYLATER";

        default:
            return null;
    }
};


// ==========================================================
// Convert Razorpay Amount
// ==========================================================

const convertAmount = (amount) => {

    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {

        return 0;
    }


    const numericAmount =
        Number(amount);


    if (
        !Number.isFinite(numericAmount)
    ) {

        return 0;
    }


    return numericAmount / 100;
};


// ==========================================================
// Resolve Gateway Reference
// ==========================================================

const getGatewayReference = (payment) => {

    return (
        payment?.acquirer_data?.bank_transaction_id ||
        payment?.acquirer_data?.rrn ||
        payment?.id ||
        null
    );
};


// ==========================================================
// Build Main Transaction Data
// ==========================================================

const buildTransactionData = ({
    merchantId,
    payment,
    event,
    eventId
}) => {

    const paymentMethod =
        resolvePaymentMethod(payment);


    const status =
        resolveTransactionStatus(event);


    const gatewayFee =
        convertAmount(payment?.fee);


    const gatewayTax =
        convertAmount(payment?.tax);


    let failureCode = null;

    let failureMessage = null;


    if (status === "FAILED") {

        failureCode =
            payment?.error_code ||
            payment?.error_reason ||
            null;


        failureMessage =
            payment?.error_description ||
            payment?.error_reason ||
            null;
    }


    return {

        merchantId,

        transactionRef:
            `TXN_${payment.id}`,

        orderId:
            payment?.order_id || null,

        gatewayOrderId:
            payment?.order_id || null,

        gatewayPaymentId:
            payment?.id || null,

        gatewayReference:
            getGatewayReference(payment),

        gatewayResponse:
            JSON.stringify(payment),

        customerName:
            payment?.notes?.customer_name ||
            null,

        customerEmail:
            payment?.email ||
            null,

        customerPhone:
            payment?.contact ||
            null,

        amount:
            convertAmount(payment?.amount),

        currency:
            payment?.currency ||
            "INR",

        paymentMethod,

        gatewayName:
            "RAZORPAY",

        paymentType:
            "PAYIN",

        status,

        completionSource:
            "WEBHOOK",

        merchantFee:
            0,

        gatewayFee,

        gatewayTax,

        settlementStatus:
            "PENDING",

        failureCode,

        failureMessage,

        attemptCount:
            1,

        expiresAt:
            null,

        /*
         * Razorpay event ID is preferred for idempotency.
         * Fallback keeps the event unique per payment/event.
         */

        idempotencyKey:
            eventId ||
            `RAZORPAY_${payment.id}_${event}`,

        clientIp:
            null,

        userAgent:
            null,

        remarks:
            `Razorpay webhook event: ${event}`
    };
};


// ==========================================================
// Build UPI Details
// ==========================================================

const buildUpiData = (payment) => {

    return {

        vpa:
            payment?.vpa ||
            null,

        payerName:
            payment?.upi?.payer_name ||
            null,

        payerAccountType:
            payment?.upi?.payer_account_type ||
            null,

        rrn:
            payment?.acquirer_data?.rrn ||
            null,

        npciTransactionId:
            payment?.acquirer_data?.upi_transaction_id ||
            payment?.upi?.upi_transaction_id ||
            null,

        bankReference:
            payment?.acquirer_data?.bank_transaction_id ||
            null,

        gatewayResponseCode:
            payment?.error_code ||
            null,

        gatewayResponseMessage:
            payment?.error_description ||
            payment?.error_reason ||
            null
    };
};


// ==========================================================
// Build Card Details
// ==========================================================

const buildCardData = (payment) => {

    return {

        cardNetwork:
            payment?.card?.network ||
            null,

        cardType:
            payment?.card?.type
                ? String(
                    payment.card.type
                ).toUpperCase()
                : null,

        lastFour:
            payment?.card?.last4 ||
            null,

        issuer:
            payment?.card?.issuer ||
            null,

        bankName:
            payment?.card?.bank_name ||
            null,

        authCode:
            payment?.acquirer_data?.auth_code ||
            null,

        gatewayReference:
            payment?.acquirer_data?.bank_transaction_id ||
            null,

        country:
            payment?.card?.country ||
            null
    };
};


// ==========================================================
// Build Netbanking Details
// ==========================================================

const buildNetbankingData = (payment) => {

    return {

        bankCode:
            payment?.bank ||
            null,

        bankName:
            payment?.bank_name ||
            null,

        bankTransactionId:
            payment?.acquirer_data
                ?.bank_transaction_id ||
            null,

        gatewayReference:
            payment?.acquirer_data
                ?.bank_transaction_id ||
            null
    };
};


// ==========================================================
// Build Wallet Details
// ==========================================================

const buildWalletData = (payment) => {

    return {

        walletName:
            payment?.wallet ||
            null,

        walletTransactionId:
            payment?.acquirer_data
                ?.wallet_transaction_id ||
            null,

        gatewayReference:
            payment?.acquirer_data
                ?.bank_transaction_id ||
            null
    };
};


// ==========================================================
// Build EMI Details
// ==========================================================

const buildEmiData = (payment) => {

    return {

        issuer:
            payment?.card?.issuer ||
            payment?.emi?.issuer ||
            null,

        tenure:
            payment?.emi?.tenure ||
            null,

        interestRate:
            payment?.emi?.interest_rate ||
            null,

        gatewayReference:
            payment?.acquirer_data
                ?.bank_transaction_id ||
            null
    };
};


// ==========================================================
// Build Paylater Details
// ==========================================================

const buildPaylaterData = (payment) => {

    return {

        providerName:
            payment?.provider ||
            payment?.paylater?.provider ||
            null,

        loanReference:
            payment?.paylater?.loan_reference ||
            null,

        dueDate:
            payment?.paylater?.due_date ||
            null,

        gatewayReference:
            payment?.acquirer_data
                ?.bank_transaction_id ||
            null
    };
};


// ==========================================================
// Store Payment Method Specific Details
// ==========================================================

const storePaymentMethodDetails = async (
    connection,
    transactionId,
    paymentMethod,
    payment
) => {

    switch (paymentMethod) {

        case "UPI":

            await helper.createUpiTransaction(
                connection,
                transactionId,
                buildUpiData(payment)
            );

            break;


        case "CARD":

            await helper.createCardTransaction(
                connection,
                transactionId,
                buildCardData(payment)
            );

            break;


        case "NETBANKING":

            await helper.createNetbankingTransaction(
                connection,
                transactionId,
                buildNetbankingData(payment)
            );

            break;


        case "WALLET":

            await helper.createWalletTransaction(
                connection,
                transactionId,
                buildWalletData(payment)
            );

            break;


        case "EMI":

            await helper.createEmiTransaction(
                connection,
                transactionId,
                buildEmiData(payment)
            );

            break;


        case "PAYLATER":

            await helper.createPaylaterTransaction(
                connection,
                transactionId,
                buildPaylaterData(payment)
            );

            break;


        default:

            throw new Error(
                `Unsupported payment method: ${paymentMethod}`
            );
    }
};


// ==========================================================
// Process Razorpay Transaction Webhook
// ==========================================================

const processTransactionWebhook = async ({
    merchantId,
    event,
    eventId,
    payload
}) => {

    // ------------------------------------------------------
    // Basic Validation
    // ------------------------------------------------------

    if (!merchantId) {

        throw new Error(
            "Merchant ID is required."
        );
    }


    if (!event) {

        throw new Error(
            "Webhook event is required."
        );
    }


    if (!payload) {

        throw new Error(
            "Webhook payload is required."
        );
    }


    // ------------------------------------------------------
    // Extract Payment
    // ------------------------------------------------------

    const payment =
        getPaymentEntity(payload);


    if (!payment) {

        throw new Error(
            "Razorpay payment entity not found."
        );
    }


    // ------------------------------------------------------
    // Payment ID Validation
    // ------------------------------------------------------

    if (!payment?.id) {

        throw new Error(
            "Razorpay payment ID not found."
        );
    }


    // ------------------------------------------------------
    // Order ID Validation
    // ------------------------------------------------------

    const orderId =
        getOrderId(payment);


    if (!orderId) {

        throw new Error(
            "Razorpay order ID not found."
        );
    }


    // ------------------------------------------------------
    // Resolve Status
    // ------------------------------------------------------

    const incomingStatus =
        resolveTransactionStatus(event);


    /*
     * Unknown Razorpay events are acknowledged by the
     * controller/service layer without creating a transaction.
     */

    if (!incomingStatus) {

        return {

            created: false,

            duplicate: false,

            ignored: true,

            reason:
                "Unsupported transaction webhook event.",

            event
        };
    }


    // ------------------------------------------------------
    // Resolve Payment Method
    // ------------------------------------------------------

    const paymentMethod =
        resolvePaymentMethod(payment);


    if (!paymentMethod) {

        throw new Error(
            `Unsupported Razorpay payment method: ${payment?.method || "UNKNOWN"}`
        );
    }


    // ------------------------------------------------------
    // Get DB Connection
    // ------------------------------------------------------

    const connection =
        await db.getConnection();


    try {

        // --------------------------------------------------
        // Start Transaction
        // --------------------------------------------------

        await connection.beginTransaction();


        // --------------------------------------------------
        // Find Existing Transaction
        //
        // IMPORTANT:
        // Merchant ID is part of lookup.
        // --------------------------------------------------

        let transaction =
            await helper.findTransactionByOrderId(
                connection,
                merchantId,
                orderId
            );


        // --------------------------------------------------
        // Fallback Lookup By Gateway Payment ID
        // --------------------------------------------------

        if (!transaction) {

            transaction =
                await helper.findTransactionByGatewayPaymentId(
                    connection,
                    merchantId,
                    payment.id
                );
        }


        // ==================================================
        // EXISTING TRANSACTION
        // ==================================================

        if (transaction) {

            const currentStatus =
                transaction.status;


            const canUpdate =
                shouldUpdateStatus(
                    currentStatus,
                    incomingStatus
                );


            // ------------------------------------------------
            // Update Existing Transaction
            // ------------------------------------------------

            if (canUpdate) {

                await helper.updateTransaction(
                    connection,
                    transaction.transaction_id,
                    {

                        gatewayPaymentId:
                            payment.id,

                        gatewayReference:
                            getGatewayReference(
                                payment
                            ),

                        gatewayResponse:
                            JSON.stringify(
                                payment
                            ),

                        paymentMethod,

                        status:
                            incomingStatus,

                        completionSource:
                            "WEBHOOK",

                        failureCode:
                            incomingStatus === "FAILED"
                                ? (
                                    payment?.error_code ||
                                    payment?.error_reason ||
                                    null
                                )
                                : null,

                        failureMessage:
                            incomingStatus === "FAILED"
                                ? (
                                    payment?.error_description ||
                                    payment?.error_reason ||
                                    null
                                )
                                : null,

                        completedAt:
                            incomingStatus === "SUCCESS"
                                ? new Date()
                                : null,

                        attemptCount:
                            Number(
                                transaction.attempt_count || 0
                            ) + 1,

                        settlementStatus:
                            transaction.settlement_status ||
                            "PENDING"
                    }
                );
            }


            // ------------------------------------------------
            // Commit Existing Transaction
            // ------------------------------------------------

            await connection.commit();


            return {

                created: false,

                duplicate:
                    !canUpdate,

                ignored:
                    !canUpdate,

                transactionId:
                    transaction.transaction_id,

                previousStatus:
                    currentStatus,

                status:
                    canUpdate
                        ? incomingStatus
                        : currentStatus
            };
        }


        // ==================================================
        // NEW TRANSACTION
        // ==================================================

        const transactionData =
            buildTransactionData({

                merchantId,

                payment,

                event,

                eventId
            });


        // --------------------------------------------------
        // Create Main Transaction
        // --------------------------------------------------

        const transactionId =
            await helper.createTransaction(
                connection,
                transactionData
            );


        if (!transactionId) {

            throw new Error(
                "Transaction creation failed."
            );
        }


        // --------------------------------------------------
        // Create Payment Method Specific Record
        // --------------------------------------------------

        await storePaymentMethodDetails(
            connection,
            transactionId,
            paymentMethod,
            payment
        );


        // --------------------------------------------------
        // Commit
        // --------------------------------------------------

        await connection.commit();


        return {

            created: true,

            duplicate: false,

            ignored: false,

            transactionId,

            status:
                transactionData.status,

            paymentMethod,

            orderId,

            gatewayPaymentId:
                payment.id
        };


    } catch (error) {

        // --------------------------------------------------
        // Rollback
        // --------------------------------------------------

        try {

            await connection.rollback();

        } catch (rollbackError) {

            /*
             * Preserve original error.
             * Rollback failure should not hide root cause.
             */
        }


        throw error;


    } finally {

        // --------------------------------------------------
        // Release DB Connection
        // --------------------------------------------------

        connection.release();
    }
};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    processTransactionWebhook

};