const { HTTP_STATUS } = require("../constants/http.constants");

const { MESSAGE } = require("../constants/message.constants");

// ==========================================================
// Not Found Middleware
// ==========================================================

const notFoundMiddleware = (

    req,

    res,

    next

) => {

    return res.status(

        HTTP_STATUS.NOT_FOUND

    ).json({

        success: false,

        message: MESSAGE.NOT_FOUND,

        path: req.originalUrl,

        method: req.method,

        timestamp: new Date().toISOString()

    });

};

// ==========================================================
// Export
// ==========================================================

module.exports = notFoundMiddleware;