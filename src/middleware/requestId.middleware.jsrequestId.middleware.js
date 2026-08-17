const { v4: uuidv4 } = require("uuid");

const requestIdMiddleware = (req, res, next) => {

    const incomingRequestId =
        req.headers["x-request-id"];

    req.id =
        incomingRequestId ||
        uuidv4();

    res.set(
        "X-Request-ID",
        req.id
    );

    next();
};

module.exports =
    requestIdMiddleware;