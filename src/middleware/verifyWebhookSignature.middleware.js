const crypto = require("crypto");

const { HTTP_STATUS } = require("../constants/http.constants");

const { MESSAGE } = require("../constants/message.constants");

// ==========================================================
// Verify Razorpay Webhook Signature
// ==========================================================

const verifyWebhookSignature = (

    req,

    res,

    next

) => {

    try {

        const signature = req.headers["x-razorpay-signature"];

        if (!signature) {

            return res.status(

                HTTP_STATUS.UNAUTHORIZED

            ).json({

                success: false,

                message: MESSAGE.INVALID_WEBHOOK_SIGNATURE

            });

        }

        const payload = JSON.stringify(req.body);

        const expectedSignature = crypto

            .createHmac(

                "sha256",

                process.env.RAZORPAY_WEBHOOK_SECRET

            )

            .update(payload)

            .digest("hex");

        if (expectedSignature !== signature) {

            return res.status(

                HTTP_STATUS.UNAUTHORIZED

            ).json({

                success: false,

                message: MESSAGE.INVALID_WEBHOOK_SIGNATURE

            });

        }

        next();

    } catch (error) {

        next(error);

    }

};

// ==========================================================
// Export
// ==========================================================

module.exports = verifyWebhookSignature;