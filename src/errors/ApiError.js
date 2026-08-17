const { HTTP_STATUS } = require("../constants/http.constants");

// ==========================================================
// Base API Error Class
// ==========================================================

class ApiError extends Error {

    constructor(

        message,

        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,

        errorCode = "API_ERROR",

        details = null

    ) {

        super(message);

        this.name = this.constructor.name;

        this.success = false;

        this.statusCode = statusCode;

        this.errorCode = errorCode;

        this.details = details;

        this.timestamp = new Date().toISOString();

        Error.captureStackTrace(

            this,

            this.constructor

        );

    }

    toJSON() {

        return {

            success: this.success,

            error: {

                code: this.errorCode,

                message: this.message,

                details: this.details

            },

            timestamp: this.timestamp

        };

    }

}

module.exports = ApiError;