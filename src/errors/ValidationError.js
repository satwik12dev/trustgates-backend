const ApiError = require("./ApiError");

const { HTTP_STATUS } = require("../constants/http.constants");

const { MESSAGE } = require("../constants/message.constants");

// ==========================================================
// Validation Error
// ==========================================================

class ValidationError extends ApiError {

    constructor(

        message = MESSAGE.VALIDATION_FAILED,

        details = null

    ) {

        super(

            message,

            HTTP_STATUS.BAD_REQUEST,

            "VALIDATION_ERROR",

            details

        );

    }

}

module.exports = ValidationError;