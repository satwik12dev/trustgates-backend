const ApiError = require("./ApiError");

const { HTTP_STATUS } = require("../constants/http.constants");

const { MESSAGE } = require("../constants/message.constants");

// ==========================================================
// Not Found Error
// ==========================================================

class NotFoundError extends ApiError {

    constructor(

        message = MESSAGE.NOT_FOUND || "Resource not found.",

        details = null

    ) {

        super(

            message,

            HTTP_STATUS.NOT_FOUND,

            "NOT_FOUND_ERROR",

            details

        );

    }

}

module.exports = NotFoundError;