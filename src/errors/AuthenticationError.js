const ApiError = require("./ApiError");

const { HTTP_STATUS } = require("../constants/http.constants");

const { MESSAGE } = require("../constants/message.constants");

// ==========================================================
// Authentication Error
// ==========================================================

class AuthenticationError extends ApiError {

    constructor(

        message = MESSAGE.UNAUTHORIZED,

        details = null

    ) {

        super(

            message,

            HTTP_STATUS.UNAUTHORIZED,

            "AUTHENTICATION_ERROR",

            details

        );

    }

}

module.exports = AuthenticationError;