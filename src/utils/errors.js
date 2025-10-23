/**
 * Custom Error Classes for standardized error handling
 * @module utils/errors
 */

/**
 * Base application error class
 * @extends Error
 */
class AppError extends Error {
    /**
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @param {boolean} isOperational - Whether error is operational (expected) or programming error
     */
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 400 - Bad Request Error
 * Used when request data is invalid or malformed
 */
class BadRequestError extends AppError {
    constructor(message = 'Bad Request') {
        super(message, 400);
    }
}

/**
 * 401 - Unauthorized Error
 * Used when authentication is required or has failed
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

/**
 * 403 - Forbidden Error
 * Used when user doesn't have permission to access resource
 */
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden - Insufficient permissions') {
        super(message, 403);
    }
}

/**
 * 404 - Not Found Error
 * Used when requested resource doesn't exist
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

/**
 * 409 - Conflict Error
 * Used when request conflicts with current state (e.g., duplicate entries)
 */
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}

/**
 * 422 - Unprocessable Entity Error
 * Used when request is well-formed but semantically invalid
 */
class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 422);
        this.errors = errors;
    }
}

/**
 * 500 - Internal Server Error
 * Used for unexpected server errors
 */
class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, false);
    }
}

module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    InternalServerError
};

