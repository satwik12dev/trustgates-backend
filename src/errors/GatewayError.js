const ApiError = require("./ApiError");

const { HTTP_STATUS } = require("../constants/http.constants");

const { MESSAGE } = require("../constants/message.constants");

// ==========================================================
// Gateway Error
// ==========================================================

class GatewayError extends ApiError {

    constructor(

        message = MESSAGE.SERVICE_UNAVAILABLE,

        details = null,

        statusCode = HTTP_STATUS.BAD_GATEWAY,

        errorCode = "GATEWAY_ERROR"

    ) {

        super(

            message,

            statusCode,

            errorCode,

            details

        );

    }

}

module.exports = GatewayError;