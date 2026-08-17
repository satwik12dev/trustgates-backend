const errorHandler = (
    err,
    req,
    res,
    next
) => {

    // ==================================================
    // Server-side Logging
    // ==================================================

    console.error(
        "API Error:",
        {
            message:
                err.message,

            code:
                err.code,

            status:
                err.status,

            path:
                req.originalUrl,

            method:
                req.method,

            requestId:
                req.id || null,

            stack:
                err.stack
        }
    );


    // ==================================================
    // Already Sent
    // ==================================================

    if (
        res.headersSent
    ) {

        return next(err);

    }


    // ==================================================
    // Status
    // ==================================================

    const rawStatus =
        Number.isInteger(
            err.statusCode
        )
            ? err.statusCode
            : Number.isInteger(
                err.status
            )
                ? err.status
                : 500;


    const statusCode =
        rawStatus >= 400 &&
        rawStatus < 600
            ? rawStatus
            : 500;


    // ==================================================
    // Safe Application Error Codes
    // ==================================================

    const safeErrorCodes = [

        "VALIDATION_ERROR",

        "INVALID_REQUEST",

        "UNAUTHORIZED",

        "FORBIDDEN",

        "NOT_FOUND",

        "CONFLICT",

        "RATE_LIMIT_EXCEEDED",

        "MERCHANT_NOT_FOUND",

        "MERCHANT_AUTH_REQUIRED",

        "ADMIN_AUTH_REQUIRED",

        "INVALID_ADMIN_CONTEXT",

        "INVALID_MERCHANT_ID",

        "KYC_NOT_FOUND",

        "KYC_ALREADY_PROCESSED",

        "INVALID_KYC_ACTION",

        "MERCHANT_NOT_ELIGIBLE",

        "EMAIL_NOT_VERIFIED",

        "KYC_NOT_APPROVED",

        "SECURITY_SERVICE_UNAVAILABLE"

    ];


    const safeCode =
        safeErrorCodes.includes(
            err.code
        )
            ? err.code
            : (
                statusCode === 500
                    ? "INTERNAL_SERVER_ERROR"
                    : "REQUEST_ERROR"
            );


    // ==================================================
    // Production
    // ==================================================

    if (
        process.env.NODE_ENV ===
        "production"
    ) {

        return res
            .status(statusCode)
            .json({

                success: false,

                error: {

                    code:
                        safeCode,

                    message:
                        statusCode === 500
                            ? "An unexpected error occurred."
                            : (
                                err.code &&
                                safeErrorCodes.includes(
                                    err.code
                                )
                                    ? err.message
                                    : "Request failed."
                            )

                },

                requestId:
                    req.id || null

            });

    }


    // ==================================================
    // Development
    // ==================================================

    return res
        .status(statusCode)
        .json({

            success: false,

            error: {

                code:
                    err.code ||
                    "INTERNAL_SERVER_ERROR",

                message:
                    err.message ||
                    "An unexpected error occurred."

            },

            requestId:
                req.id || null

        });

};


module.exports =
    errorHandler;