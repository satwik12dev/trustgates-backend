const ApiError = require("./ApiError");

const { HTTP_STATUS } = require("../constants/http.constants");

const { MESSAGE } = require("../constants/message.constants");

// ==========================================================
// Authorization Error
// ==========================================================

class AuthorizationError extends ApiError {

    constructor(

        message = MESSAGE.ACCESS_DENIED,

        details = null

    ) {

        super(

            message,

            HTTP_STATUS.FORBIDDEN,

            "AUTHORIZATION_ERROR",

            details

        );

    }

}

module.exports = AuthorizationError;