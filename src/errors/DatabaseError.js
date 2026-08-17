const ApiError = require("./ApiError");

const { HTTP_STATUS } = require("../constants/http.constants");

const { MESSAGE } = require("../constants/message.constants");

// ==========================================================
// Database Error
// ==========================================================

class DatabaseError extends ApiError {

    constructor(

        message = MESSAGE.INTERNAL_SERVER_ERROR,

        details = null,

        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,

        errorCode = "DATABASE_ERROR"

    ) {

        super(

            message,

            statusCode,

            errorCode,

            details

        );

    }

}

module.exports = DatabaseError;