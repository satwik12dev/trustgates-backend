const ApiError = require("./ApiError");

const { HTTP_STATUS } = require("../constants/http.constants");

const { MESSAGE } = require("../constants/message.constants");

// ==========================================================
// Conflict Error
// ==========================================================

class ConflictError extends ApiError {

    constructor(

        message = MESSAGE.CONFLICT || "Resource already exists.",

        details = null

    ) {

        super(

            message,

            HTTP_STATUS.CONFLICT,

            "CONFLICT_ERROR",

            details

        );

    }

}

module.exports = ConflictError;