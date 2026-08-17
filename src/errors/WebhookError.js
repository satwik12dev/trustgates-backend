// ==========================================================
// Webhook Error
// ==========================================================

class WebhookError extends Error {

    constructor(

        message,

        statusCode = 500,

        details = null

    ) {

        super(message);

        this.name = "WebhookError";

        this.statusCode = statusCode;

        this.details = details;

        Error.captureStackTrace(

            this,

            this.constructor

        );

    }

}

// ==========================================================
// Export
// ==========================================================

module.exports = WebhookError;