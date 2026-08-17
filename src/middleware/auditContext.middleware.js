const crypto = require("crypto");

const auditContext = (req, res, next) => {

    try {

        const incomingRequestId =
            req.headers["x-request-id"];

        const requestId =
            typeof incomingRequestId === "string" &&
            incomingRequestId.trim() &&
            incomingRequestId.length <= 100
                ? incomingRequestId.trim()
                : crypto.randomUUID();

        const forwardedFor =
            req.headers["x-forwarded-for"];

        let ipAddress =
            req.ip ||
            req.socket?.remoteAddress ||
            null;

        if (
            typeof forwardedFor === "string" &&
            forwardedFor.trim()
        ) {
            ipAddress =
                forwardedFor
                    .split(",")[0]
                    .trim();
        }

        if (
            typeof ipAddress === "string" &&
            ipAddress.startsWith("::ffff:")
        ) {
            ipAddress =
                ipAddress.substring(7);
        }

        const userAgent =
            req.get("user-agent") || null;

        req.audit = {
            requestId,
            ipAddress,
            userAgent
        };

        res.setHeader(
            "X-Request-ID",
            requestId
        );

        next();

    } catch (error) {
        next(error);
    }
};

module.exports = auditContext;