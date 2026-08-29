// ==========================================================
// Razorpay Transaction Webhook Middleware
// Merchant-specific webhook verification
// ==========================================================

const crypto = require("crypto");

const db = require("../../config/pool");

const {
    HTTP_STATUS
} = require("../../constants/http.constants");

const {
    MESSAGE
} = require("../../constants/message.constants");


// ==========================================================
// Get Raw Request Body
// ==========================================================

const getRawBody = (req) => {

    if (Buffer.isBuffer(req.rawBody)) {
        return req.rawBody;
    }

    if (typeof req.rawBody === "string") {
        return Buffer.from(req.rawBody);
    }

    /*
     * Fallback only if rawBody middleware is not configured.
     * For production, rawBody should always be available.
     */
    if (req.body && typeof req.body === "object") {
        return Buffer.from(JSON.stringify(req.body));
    }

    return null;
};


// ==========================================================
// Safe Signature Comparison
// ==========================================================

const isValidSignature = (
    rawBody,
    signature,
    secret
) => {

    if (!rawBody || !signature || !secret) {
        return false;
    }

    const expectedSignature =
        crypto
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");

    const expectedBuffer =
        Buffer.from(expectedSignature, "utf8");

    const receivedBuffer =
        Buffer.from(signature, "utf8");

    if (
        expectedBuffer.length !==
        receivedBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
    );
};


// ==========================================================
// Middleware
// ==========================================================

const verifyRazorpayTransactionWebhook = async (
    req,
    res,
    next
) => {

    let connection;

    try {

        // --------------------------------------------------
        // 1. Get Razorpay Signature
        // --------------------------------------------------

        const signature =
            req.headers["x-razorpay-signature"];


        if (!signature) {

            return res.status(
                HTTP_STATUS.UNAUTHORIZED
            ).json({

                success: false,

                message:
                    MESSAGE.INVALID_WEBHOOK_SIGNATURE
            });
        }


        // --------------------------------------------------
        // 2. Get Merchant ID
        // --------------------------------------------------

        const merchantId =
            req.params.merchantId;


        if (!merchantId) {

            return res.status(
                HTTP_STATUS.BAD_REQUEST
            ).json({

                success: false,

                message:
                    "Webhook merchant ID is required."
            });
        }


        // --------------------------------------------------
        // 3. Validate Merchant ID
        // --------------------------------------------------

        if (!/^\d+$/.test(String(merchantId))) {

            return res.status(
                HTTP_STATUS.BAD_REQUEST
            ).json({

                success: false,

                message:
                    "Invalid webhook merchant ID."
            });
        }


        // --------------------------------------------------
        // 4. Get Raw Body
        // --------------------------------------------------

        const rawBody =
            getRawBody(req);


        if (!rawBody) {

            return res.status(
                HTTP_STATUS.BAD_REQUEST
            ).json({

                success: false,

                message:
                    "Raw webhook body is required."
            });
        }


        // --------------------------------------------------
        // 5. Get Merchant Razorpay Configuration
        // --------------------------------------------------

        connection =
            await db.getConnection();


        const [providers] =
            await connection.execute(
                `
                SELECT
                    provider_id,
                    merchant_id,
                    provider,
                    webhook_secret,
                    status
                FROM merchant_payment_providers
                WHERE merchant_id = ?
                  AND provider = 'RAZORPAY'
                  AND status = 'ACTIVE'
                LIMIT 1
                `,
                [merchantId]
            );


        if (!providers.length) {

            return res.status(
                HTTP_STATUS.NOT_FOUND
            ).json({

                success: false,

                message:
                    "Active Razorpay payment provider configuration not found."
            });
        }


        const provider =
            providers[0];


        // --------------------------------------------------
        // 6. Webhook Secret Validation
        // --------------------------------------------------

        if (!provider.webhook_secret) {

            return res.status(
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            ).json({

                success: false,

                message:
                    "Razorpay webhook secret is not configured."
            });
        }


        // --------------------------------------------------
        // 7. Verify Razorpay Signature
        // --------------------------------------------------

        const valid =
            isValidSignature(
                rawBody,
                signature,
                provider.webhook_secret
            );


        if (!valid) {

            return res.status(
                HTTP_STATUS.UNAUTHORIZED
            ).json({

                success: false,

                message:
                    MESSAGE.INVALID_WEBHOOK_SIGNATURE
            });
        }


        // --------------------------------------------------
        // 8. Parse Payload
        // --------------------------------------------------

        let payload =
            req.body;


        if (
            !payload ||
            typeof payload !== "object"
        ) {

            try {

                payload =
                    JSON.parse(
                        rawBody.toString("utf8")
                    );

            } catch (parseError) {

                return res.status(
                    HTTP_STATUS.BAD_REQUEST
                ).json({

                    success: false,

                    message:
                        "Invalid webhook payload."
                });
            }
        }


        // --------------------------------------------------
        // 9. Extract Event
        // --------------------------------------------------

        const event =
            payload?.event;


        if (!event) {

            return res.status(
                HTTP_STATUS.BAD_REQUEST
            ).json({

                success: false,

                message:
                    "Webhook event is missing."
            });
        }


        // --------------------------------------------------
        // 10. Extract Event ID
        // --------------------------------------------------

        const eventId =
            req.headers["x-razorpay-event-id"] ||
            null;


        // --------------------------------------------------
        // 11. Attach Trusted Data To Request
        // --------------------------------------------------

        req.merchantId =
            Number(provider.merchant_id);

        req.providerId =
            Number(provider.provider_id);

        req.webhookEvent =
            event;

        req.webhookEventId =
            eventId;

        req.webhookProvider =
            provider.provider;

        req.webhookPayload =
            payload;

        req.webhookVerified =
            true;


        // --------------------------------------------------
        // 12. Continue
        // --------------------------------------------------

        return next();

    } catch (error) {

        return next(error);

    } finally {

        if (connection) {
            connection.release();
        }
    }
};


// ==========================================================
// Export
// ==========================================================

module.exports =
    verifyRazorpayTransactionWebhook;