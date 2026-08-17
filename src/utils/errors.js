class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 404;
    }
}

class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 409;
    }
}

class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 401;
    }
}

class GatewayError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 502;
    }
}


class InternalServerError extends Error {

    constructor(message = "Internal server error.") {

        super(message);

        this.statusCode = 500;

    }

}

module.exports = {
    BadRequestError,
    NotFoundError,
    ConflictError,
    UnauthorizedError,
    GatewayError,
    InternalServerError
};