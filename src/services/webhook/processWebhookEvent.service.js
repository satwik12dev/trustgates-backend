const pool = require(
    "../../config/pool"
);

const WEBHOOK_EVENT_QUERIES = require(
    "../../queries/webhook/webhookEvent.query"
);

const {
    lockTransactionByGatewayOrderId,
    processSuccessfulPayment,
    processFailedPayment,
    markTransactionAuthorized
} = require(
    "../transaction/transaction.service"
);

const creditWalletService = require(
    "../wallet/creditWallet.service"
);

const {
    TRANSACTION_EVENT
} = require(
    "../../constants/transactions.constants"
);


// ==========================================================
// Process Webhook Event
// ==========================================================

const processWebhookEvent = async ({
    provider,
    eventId
}) => {

    let connection = null;

    let webhookEventId = null;


    try {

        connection =
            await pool.getConnection();


        await connection.beginTransaction();


        // ==================================================
        // Get Webhook Event
        // ==================================================

        const [
            eventRows
        ] = await connection.query(

            WEBHOOK_EVENT_QUERIES
                .GET_EVENT_FOR_PROCESSING,

            [
                provider,
                eventId
            ]

        );


        if (
            !eventRows.length
        ) {

            const error =
                new Error(
                    "Webhook event not found."
                );

            error.statusCode = 404;

            throw error;

        }


        const webhookEvent =
            eventRows[0];


        webhookEventId =
            webhookEvent.webhook_event_id;


        // ==================================================
        // Provider Validation
        // ==================================================

        if (
            webhookEvent.provider !==
            provider
        ) {

            throw new Error(
                "Webhook provider mismatch."
            );

        }


        // ==================================================
        // Processing State
        // ==================================================

        if (
            webhookEvent.processing_status ===
            "PROCESSED"
        ) {

            await connection.commit();


            return {

                success: true,

                duplicate: true,

                webhookEventId,

                eventId:
                    webhookEvent.event_id,

                processingStatus:
                    "PROCESSED"

            };

        }


        if (
            webhookEvent.processing_status ===
            "PROCESSING"
        ) {

            await connection.commit();


            return {

                success: true,

                processing: true,

                webhookEventId,

                eventId:
                    webhookEvent.event_id,

                processingStatus:
                    "PROCESSING"

            };

        }


        if (
            webhookEvent.processing_status ===
            "FAILED"
        ) {

            await connection.commit();


            return {

                success: false,

                retryable: true,

                webhookEventId,

                eventId:
                    webhookEvent.event_id,

                processingStatus:
                    "FAILED"

            };

        }


        // ==================================================
        // Mark Processing
        // ==================================================

        const [
            processingResult
        ] = await connection.query(

            WEBHOOK_EVENT_QUERIES
                .MARK_PROCESSING,

            [
                webhookEventId
            ]

        );


        if (
            processingResult.affectedRows !== 1
        ) {

            await connection.rollback();


            return {

                success: true,

                processing: true,

                webhookEventId,

                eventId:
                    webhookEvent.event_id,

                processingStatus:
                    "PROCESSING"

            };

        }


        // ==================================================
        // Parse Payload
        // ==================================================

        let payload =
            webhookEvent.payload;


        if (
            typeof payload === "string"
        ) {

            try {

                payload =
                    JSON.parse(payload);

            }
            catch {

                throw new Error(
                    "Invalid stored webhook payload."
                );

            }

        }


        if (
            !payload ||
            typeof payload !== "object"
        ) {

            throw new Error(
                "Webhook payload is invalid."
            );

        }


        const eventType =
            webhookEvent.event_type;


        // ==================================================
        // Razorpay Payment Entity
        // ==================================================

        const payment =
            payload
                ?.payload
                ?.payment
                ?.entity || null;


        // ==================================================
        // PAYMENT.CREATED
        // ==================================================

        if (
            eventType ===
            TRANSACTION_EVENT.PAYMENT_CREATED
        ) {

            await connection.query(

                WEBHOOK_EVENT_QUERIES
                    .MARK_PROCESSED,

                [
                    webhookEventId
                ]

            );


            await connection.commit();


            return {

                success: true,

                duplicate: false,

                webhookEventId,

                eventId:
                    webhookEvent.event_id,

                eventType,

                processingStatus:
                    "PROCESSED"

            };

        }


        // ==================================================
        // PAYMENT.AUTHORIZED
        // ==================================================

        if (
            eventType ===
            TRANSACTION_EVENT.PAYMENT_AUTHORIZED
        ) {

            if (
                !payment
            ) {

                throw new Error(
                    "Payment entity missing from Razorpay webhook."
                );

            }


            if (
                !payment.order_id
            ) {

                throw new Error(
                    "Razorpay gateway order ID is missing."
                );

            }


            if (
                !payment.id
            ) {

                throw new Error(
                    "Razorpay gateway payment ID is missing."
                );

            }


            const transaction =
                await lockTransactionByGatewayOrderId(

                    connection,

                    payment.order_id

                );


            if (
                !transaction
            ) {

                throw new Error(
                    "Transaction not found for Razorpay gateway order ID."
                );

            }


            // ----------------------------------------------
            // Merchant Validation
            // ----------------------------------------------

            if (
                Number(
                    transaction.merchant_id
                ) !==
                Number(
                    webhookEvent.merchant_id
                )
            ) {

                throw new Error(
                    "Transaction merchant does not match webhook merchant."
                );

            }


            // ----------------------------------------------
            // Gateway Validation
            // ----------------------------------------------

            if (
                transaction.gateway_name !==
                provider
            ) {

                throw new Error(
                    "Transaction gateway does not match webhook provider."
                );

            }


            // ----------------------------------------------
            // Already Successful
            // ----------------------------------------------

            if (
                transaction.status ===
                "SUCCESS"
            ) {

                await connection.query(

                    WEBHOOK_EVENT_QUERIES
                        .MARK_PROCESSED,

                    [
                        webhookEventId
                    ]

                );


                await connection.commit();


                return {

                    success: true,

                    duplicate: true,

                    webhookEventId,

                    transactionId:
                        transaction.transaction_id,

                    merchantId:
                        transaction.merchant_id,

                    eventId:
                        webhookEvent.event_id,

                    eventType,

                    processingStatus:
                        "PROCESSED"

                };

            }


            await markTransactionAuthorized(

                connection,

                {

                    transactionId:
                        transaction.transaction_id,

                    gatewayPaymentId:
                        payment.id,

                    gatewayReference:
                        payment.id,

                    gatewayResponse:
                        payload

                }

            );


            await connection.query(

                WEBHOOK_EVENT_QUERIES
                    .MARK_PROCESSED,

                [
                    webhookEventId
                ]

            );


            await connection.commit();


            return {

                success: true,

                duplicate: false,

                webhookEventId,

                transactionId:
                    transaction.transaction_id,

                merchantId:
                    transaction.merchant_id,

                eventId:
                    webhookEvent.event_id,

                eventType,

                processingStatus:
                    "PROCESSED"

            };

        }


        // ==================================================
        // PAYMENT.CAPTURED
        // ==================================================

        if (
            eventType ===
            TRANSACTION_EVENT.PAYMENT_CAPTURED
        ) {

            if (
                !payment
            ) {

                throw new Error(
                    "Payment entity missing from Razorpay webhook."
                );

            }


            if (
                !payment.order_id
            ) {

                throw new Error(
                    "Razorpay gateway order ID is missing."
                );

            }


            if (
                !payment.id
            ) {

                throw new Error(
                    "Razorpay gateway payment ID is missing."
                );

            }


            // ----------------------------------------------
            // Lock Transaction
            // ----------------------------------------------

            const transaction =
                await lockTransactionByGatewayOrderId(

                    connection,

                    payment.order_id

                );


            if (
                !transaction
            ) {

                throw new Error(
                    "Transaction not found for Razorpay gateway order ID."
                );

            }


            // ----------------------------------------------
            // Merchant Validation
            // ----------------------------------------------

            if (
                Number(
                    transaction.merchant_id
                ) !==
                Number(
                    webhookEvent.merchant_id
                )
            ) {

                throw new Error(
                    "Transaction merchant does not match webhook merchant."
                );

            }


            // ----------------------------------------------
            // Gateway Validation
            // ----------------------------------------------

            if (
                transaction.gateway_name !==
                provider
            ) {

                throw new Error(
                    "Transaction gateway does not match webhook provider."
                );

            }


            // ----------------------------------------------
            // Amount Validation
            // ----------------------------------------------

            if (
                payment.amount ===
                undefined ||
                payment.amount ===
                null
            ) {

                throw new Error(
                    "Razorpay payment amount is missing."
                );

            }


            const gatewayAmount =
                Number(
                    payment.amount
                ) / 100;


            const transactionAmount =
                Number(
                    transaction.amount
                );


            if (
                !Number.isFinite(
                    gatewayAmount
                ) ||
                gatewayAmount <= 0
            ) {

                throw new Error(
                    "Invalid Razorpay payment amount."
                );

            }


            if (
                Math.abs(
                    gatewayAmount -
                    transactionAmount
                ) > 0.01
            ) {

                throw new Error(
                    "Razorpay payment amount does not match transaction amount."
                );

            }


            // ----------------------------------------------
            // Currency Validation
            // ----------------------------------------------

            if (
                payment.currency &&
                payment.currency !==
                transaction.currency
            ) {

                throw new Error(
                    "Razorpay payment currency does not match transaction currency."
                );

            }


            // ==================================================
            // Transaction Success
            // ==================================================

            let transactionDuplicate =
                false;


            if (
                transaction.status !==
                "SUCCESS"
            ) {

                const transactionResult =
                    await processSuccessfulPayment(

                        connection,

                        {

                            transaction,

                            gatewayPaymentId:
                                payment.id,

                            gatewayReference:
                                payment.id,

                            gatewayResponse:
                                payload,

                            gatewayFee:
                                0,

                            gatewayTax:
                                0

                        }

                    );


                transactionDuplicate =
                    Boolean(
                        transactionResult.duplicate
                    );

            }
            else {

                transactionDuplicate =
                    true;

            }


            // ==================================================
            // WALLET CREDIT
            // ==================================================
            //
            // IMPORTANT:
            //
            // Wallet credit MUST happen even when the
            // transaction is already SUCCESS.
            //
            // wallet service has its own idempotency protection.
            //
            // ==================================================

            const walletResult =
                await creditWalletService(

                    connection,

                    {

                        merchantId:
                            transaction.merchant_id,

                        amount:
                            transactionAmount,

                        referenceId:
                            transaction.transaction_ref,

                        idempotencyKey:
                            `PAYMENT:TRANSACTION:${transaction.transaction_id}`,

                        description:
                            "Wallet credited after successful Razorpay payment.",

                        metadata: {

                            transactionId:
                                transaction.transaction_id,

                            transactionRef:
                                transaction.transaction_ref,

                            webhookEventId,

                            webhookEventExternalId:
                                webhookEvent.event_id,

                            provider,

                            eventType,

                            gatewayOrderId:
                                payment.order_id,

                            gatewayPaymentId:
                                payment.id,

                            gatewayAmount,

                            currency:
                                transaction.currency

                        }

                    }

                );


            // ==================================================
            // Mark Webhook Processed
            // ==================================================

            await connection.query(

                WEBHOOK_EVENT_QUERIES
                    .MARK_PROCESSED,

                [
                    webhookEventId
                ]

            );


            await connection.commit();


            return {

                success: true,

                duplicate:
                    transactionDuplicate &&
                    walletResult.duplicate,

                transactionDuplicate,

                walletDuplicate:
                    walletResult.duplicate,

                webhookEventId,

                transactionId:
                    transaction.transaction_id,

                merchantId:
                    transaction.merchant_id,

                walletId:
                    walletResult.walletId,

                ledgerId:
                    walletResult.ledgerId,

                amount:
                    transactionAmount,

                currency:
                    transaction.currency,

                eventId:
                    webhookEvent.event_id,

                eventType,

                processingStatus:
                    "PROCESSED"

            };

        }


        // ==================================================
        // PAYMENT.FAILED
        // ==================================================

        if (
            eventType ===
            TRANSACTION_EVENT.PAYMENT_FAILED
        ) {

            if (
                !payment
            ) {

                throw new Error(
                    "Payment entity missing from Razorpay webhook."
                );

            }


            if (
                !payment.order_id
            ) {

                throw new Error(
                    "Razorpay gateway order ID is missing."
                );

            }


            const transaction =
                await lockTransactionByGatewayOrderId(

                    connection,

                    payment.order_id

                );


            if (
                !transaction
            ) {

                throw new Error(
                    "Transaction not found for Razorpay gateway order ID."
                );

            }


            // ----------------------------------------------
            // Merchant Validation
            // ----------------------------------------------

            if (
                Number(
                    transaction.merchant_id
                ) !==
                Number(
                    webhookEvent.merchant_id
                )
            ) {

                throw new Error(
                    "Transaction merchant does not match webhook merchant."
                );

            }


            // ----------------------------------------------
            // Gateway Validation
            // ----------------------------------------------

            if (
                transaction.gateway_name !==
                provider
            ) {

                throw new Error(
                    "Transaction gateway does not match webhook provider."
                );

            }


            const failureCode =
                payment.error_code ||
                payment.error?.code ||
                null;


            const failureMessage =
                payment.error_description ||
                payment.error?.description ||
                null;


            const transactionResult =
                await processFailedPayment(

                    connection,

                    {

                        transaction,

                        gatewayPaymentId:
                            payment.id || null,

                        gatewayResponse:
                            payload,

                        failureCode,

                        failureMessage

                    }

                );


            await connection.query(

                WEBHOOK_EVENT_QUERIES
                    .MARK_PROCESSED,

                [
                    webhookEventId
                ]

            );


            await connection.commit();


            return {

                success: true,

                duplicate:
                    transactionResult.duplicate,

                webhookEventId,

                transactionId:
                    transaction.transaction_id,

                merchantId:
                    transaction.merchant_id,

                eventId:
                    webhookEvent.event_id,

                eventType,

                processingStatus:
                    "PROCESSED"

            };

        }


        // ==================================================
        // Unsupported Event
        // ==================================================

        throw new Error(
            `Unsupported Razorpay webhook event: ${eventType}`
        );

    }
    catch (error) {

        if (
            connection
        ) {

            try {

                await connection.rollback();

            }
            catch {
                // Preserve original error.
            }

        }


        // ==================================================
        // Mark Webhook Failed
        // ==================================================

        if (
            webhookEventId
        ) {

            let failureConnection = null;


            try {

                failureConnection =
                    await pool.getConnection();


                await failureConnection.query(

                    WEBHOOK_EVENT_QUERIES
                        .MARK_FAILED,

                    [

                        error.message,

                        webhookEventId

                    ]

                );

            }
            catch {
                // Preserve original processing error.
            }
            finally {

                if (
                    failureConnection
                ) {

                    failureConnection.release();

                }

            }

        }


        throw error;

    }
    finally {

        if (
            connection
        ) {

            connection.release();

        }

    }

};


module.exports = {
    processWebhookEvent
};